import { addToVectorStore } from './vectorStore';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { load } from 'cheerio';
import { Document } from '@langchain/core/documents';

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export class DocumentLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentLoadError';
  }
}

/**
 * Loads, chunks, and stores a document source in the vector store.
 */
export async function processDocument(
  source: File | string,
  type: 'file' | 'url',
  mimeType?: string,
  userId?: string,
) {
  let docs: Document[];

  try {
    if (type === 'url') {
      const response = await fetch(source as string, {
        headers: { 'User-Agent': 'AiDevOps-Ingest/1.0' },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new DocumentLoadError(`Failed to load URL: HTTP ${response.status}`);
      }
      const html = await response.text();
      const $ = load(html);
      $('script, style, noscript').remove();
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      if (!text) {
        throw new DocumentLoadError('Failed to load URL: no text content extracted');
      }
      docs = [
        new Document({
          pageContent: text,
          metadata: { source: source as string },
        }),
      ];
    } else {
      const file = source as File;
      const blob = new Blob([file], { type: mimeType });
      const loader =
        mimeType === 'application/pdf' ? new PDFLoader(blob) : new TextLoader(blob);
      docs = await loader.load();
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    if (type === 'url') {
      throw new DocumentLoadError(`Failed to load URL: ${detail}`);
    }
    throw new DocumentLoadError(`Failed to load file: ${detail}`);
  }

  if (!docs.length) {
    throw new DocumentLoadError(
      type === 'url' ? 'Failed to load URL: no content extracted' : 'Failed to load file: empty document',
    );
  }

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const splits = await textSplitter.splitDocuments(docs);

  splits.forEach((split) => {
    split.metadata = split.metadata || {};
    if (userId) {
      split.metadata.userId = userId;
    }
    split.metadata.fileType = type === 'url' ? 'webpage' : mimeType || 'unknown';
    if (split.metadata.source && typeof split.metadata.source !== 'string') {
      split.metadata.source = String(split.metadata.source);
    }
  });

  await addToVectorStore(splits, userId);
}
