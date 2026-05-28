// lib/vectorStore.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { getEmbeddingModel } from './embeddings';
import { Document } from '@langchain/core/documents';

let vectorStore: PineconeStore | null = null;
const RAG_N_RESULTS = process.env.RAG_N_RESULTS ? parseInt(process.env.RAG_N_RESULTS, 10) : 6;

async function getVectorStore() {
  if (!vectorStore) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('❌ PINECONE_API_KEY is not set in environment variables');
    }
    if (!process.env.PINECONE_INDEX) {
      throw new Error('❌ PINECONE_INDEX is not set in environment variables');
    }

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

    const index = pc.Index(process.env.PINECONE_INDEX!);

    const embeddings = getEmbeddingModel();

    vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: process.env.PINECONE_NAMESPACE || undefined,
    });
  }
  return vectorStore;
}

export async function addToVectorStore(docs: Document[]) {
  const store = await getVectorStore();
  await store.addDocuments(docs);
  console.log(`✅ Added ${docs.length} documents to Pinecone`);
  return true;
}

export async function semanticSearch(query: string, userId?: string): Promise<string[]> {
  try {
    const store = await getVectorStore();
    const filter: Record<string, any> | undefined = userId ?
      { '$or': [{ 'userId': { '$eq': userId } }, { 'userId': { '$exists': false } }] } :
      undefined;

    const results = await store.similaritySearch(query, RAG_N_RESULTS, filter);
    return results.map((doc) => doc.pageContent);
  } catch (error) {
    console.error('Error performing semantic search in Pinecone:', error);
    return [];
  }
}