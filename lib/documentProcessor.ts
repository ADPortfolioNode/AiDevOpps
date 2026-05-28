import { addToVectorStore } from "./vectorStore";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import type { Document } from '@langchain/core/documents';

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

/**
 * This function acts as the "Task Assistant" for document processing.
 * It takes a document source (file or URL), loads it, splits it into chunks,
 * and stores them in the vector store.
 *
 * @param source The document source, which can be a File object or a URL string.
 * @param type The type of the source ('file' or 'url').
 * @param mimeType Optional mime type for file sources.
 * @param userId Optional user ID to associate with the document.
 */
export async function processDocument(
  source: File | string,
  type: 'file' | 'url',
  mimeType?: string,
  userId?: string,
) {
  let docs: Document[];

  if (type === 'url') {
    const loader = new CheerioWebBaseLoader(source as string);
    docs = await loader.load();
  } else {
    const file = source as File;
    const blob = new Blob([file], { type: mimeType });
    const loader =
      mimeType === 'application/pdf'
        ? new PDFLoader(blob)
        : new TextLoader(blob);
    docs = await loader.load();
  }

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const splits = await textSplitter.splitDocuments(docs);

  // Add user ID and other metadata to each chunk
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

  // Use the LangChain vector store to add documents, which handles embedding.
  await addToVectorStore(splits);
}
