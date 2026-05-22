import { ChromaClient, Collection } from 'chromadb';

const CHROMA_DB_URL = process.env.CHROMA_DB_URL || 'http://localhost:8000';
const COLLECTION_NAME = 'aidevops_knowledge_base';

let chromaClient: ChromaClient | null = null;
let chromaCollection: Collection | null = null;

/**
 * Initializes and returns the ChromaDB client.
 */
export function getChromaClient(): ChromaClient {
  if (!chromaClient) {
    chromaClient = new ChromaClient({ path: CHROMA_DB_URL });
  }
  return chromaClient;
}

/**
 * Gets or creates the ChromaDB collection for the knowledge base.
 */
export async function getChromaCollection(): Promise<Collection> {
  if (!chromaCollection) {
    const client = getChromaClient();
    chromaCollection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
    });
  }
  return chromaCollection;
}