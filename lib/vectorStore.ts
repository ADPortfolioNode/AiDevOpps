import type { Message } from './serverCache';

const fallbackMessages: Message[] = [];
let vectorStore: any = null;

async function createVectorStore() {
  try {
    const module = await import('@lancedb/lancedb');
    const LanceDBCtor = (module as any).default ?? (module as any).LanceDB ?? (module as any).Lance;

    if (typeof LanceDBCtor === 'function') {
      vectorStore = new LanceDBCtor({
        collectionName: 'aidevopps',
        path: './.aidevopps_lancedb'
      });
      return vectorStore;
    }
  } catch (error) {
    console.warn('LanceDB vector store unavailable; using fallback in-memory store.', error);
  }
  return null;
}

export async function addToVectorStore(message: Message) {
  fallbackMessages.push(message);

  if (!vectorStore) {
    await createVectorStore();
  }

  if (vectorStore && typeof vectorStore.addDocuments === 'function') {
    try {
      await vectorStore.addDocuments([
        {
          id: message.id,
          text: message.text,
          metadata: { role: message.role }
        }
      ]);
    } catch {
      // ignore Lancedb failures and continue with fallback storage
    }
  }
}

export async function semanticSearch(query: string) {
  if (vectorStore && typeof vectorStore.similaritySearch === 'function') {
    try {
      return await vectorStore.similaritySearch(query, 3);
    } catch {
      return fallbackMessages.filter((message) => message.text.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
    }
  }

  return fallbackMessages.filter((message) => message.text.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
}
