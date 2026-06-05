// lib/vectorStore.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { FakeEmbeddings } from '@langchain/core/utils/testing';
import { Document } from '@langchain/core/documents';
import { getEmbeddings } from './embeddings';

const RAG_N_RESULTS = process.env.RAG_N_RESULTS ? parseInt(process.env.RAG_N_RESULTS, 10) : 6;

const SEED_DOCUMENTS: Document[] = [
  new Document({
    pageContent:
      'AiDevOps is a Next.js dashboard for AI Operations Management. It provides an interactive chat UI, document ingestion (PDF, text, URLs), and a Concierge agent with RAG over your knowledge base.',
    metadata: { source: 'seed', userId: 'anonymous-user' },
  }),
];

type AnyVectorStore = MemoryVectorStore | PineconeStore;

let vectorStore: AnyVectorStore | null = null;
let usingMemoryStore = false;

/** Pinecone is opt-in so the app runs without paid API quota. Set USE_PINECONE=true to enable. */
function shouldUsePinecone(): boolean {
  return (
    process.env.USE_PINECONE === 'true' &&
    Boolean(process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX)
  );
}

async function createMemoryVectorStore(): Promise<MemoryVectorStore> {
  usingMemoryStore = true;
  const store = await MemoryVectorStore.fromDocuments(SEED_DOCUMENTS, new FakeEmbeddings());
  console.log('ℹ️ Using in-memory vector store.');
  return store;
}

async function resetToMemoryStore(): Promise<MemoryVectorStore> {
  vectorStore = null;
  return createMemoryVectorStore();
}

export async function getVectorStore(): Promise<AnyVectorStore> {
  if (vectorStore) {
    return vectorStore;
  }

  if (!shouldUsePinecone()) {
    vectorStore = await createMemoryVectorStore();
    return vectorStore;
  }

  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.index(process.env.PINECONE_INDEX!);
    const embeddings = getEmbeddings();

    vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index as never,
      namespace: process.env.PINECONE_NAMESPACE || 'default',
    });
    usingMemoryStore = false;
    return vectorStore;
  } catch (error) {
    console.warn('Pinecone init failed, falling back to in-memory store:', error);
    vectorStore = await createMemoryVectorStore();
    return vectorStore;
  }
}

export async function addToVectorStore(docs: Document[], userId?: string) {
  if (userId) {
    docs.forEach((doc) => {
      doc.metadata = { ...doc.metadata, userId };
    });
  }

  try {
    const store = await getVectorStore();
    await store.addDocuments(docs);
    console.log(`✅ Added ${docs.length} documents to ${usingMemoryStore ? 'in-memory' : 'Pinecone'} store`);
    return true;
  } catch (error) {
    console.warn('Vector store write failed, retrying with in-memory store:', error);
    vectorStore = await resetToMemoryStore();
    await vectorStore.addDocuments(docs);
    console.log(`✅ Added ${docs.length} documents to in-memory store (fallback)`);
    return true;
  }
}

export async function semanticSearch(query: string, userId?: string): Promise<string[]> {
  try {
    const store = await getVectorStore();
    const results: Document[] = await store.similaritySearch(query, RAG_N_RESULTS);
    const filtered = userId
      ? results.filter(
          (doc: Document) => !doc.metadata?.userId || doc.metadata.userId === userId,
        )
      : results;
    return filtered.map((doc: Document) => doc.pageContent);
  } catch (error) {
    console.warn('Semantic search failed, using seeded context:', error);
    try {
      const mem = await resetToMemoryStore();
      const results: Document[] = await mem.similaritySearch(query, RAG_N_RESULTS);
      return results.map((doc) => doc.pageContent);
    } catch {
      return SEED_DOCUMENTS.map((doc) => doc.pageContent);
    }
  }
}
