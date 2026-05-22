# AiDevOps - AI Operations Management Dashboard

AiDevOps is a Next.js 15 App Router dashboard designed for AI Operations Management, featuring a multi-provider LLM system, chat UI, quick action cards, and integrated local Retrieval-Augmented Generation (RAG) with ChromaDB.

## Features

- **Next.js 15 App Router:** Modern and performant React framework.
- **Multi-provider LLM Support:** Seamlessly switch between OpenAI, Anthropic, and local Ollama models.
- **Interactive Chat UI:** Engage with AI assistants for various tasks.
- **Quick Action Cards:** Streamlined access to common operations.
- **Local RAG with ChromaDB:** Enhance AI responses with context from your own documents.
- **Document Upload:** Easily ingest PDFs, text files, and URLs into your knowledge base.
- **Agentic Architecture:** Concierge acts as an administrator, coordinating specialized assistants.
- **Docker-Compose Setup:** Run the entire application stack (Next.js, ChromaDB, Ollama) with a single command.

## Getting Started

### Prerequisites

- Docker and Docker Compose installed.
- Node.js (v18 or higher) and npm.

### 1. Clone the Repository

```bash
git clone https://github.com/ADPortfolioNode/AiDevOpps.git
cd AiDevOps
```

### 2. Environment Variables

Create a `.env.local` file in the root of your project based on `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and configure your LLM API keys and RAG settings:

```
# LLM Provider Configuration (Example for OpenAI)
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# GEMINI_API_KEY=your_gemini_api_key_here

# RAG Configuration
CHROMA_DB_URL=http://localhost:8000
EMBEDDING_MODEL_NAME=nomic-embed-text # Recommended for local RAG with Ollama. Can be 'text-embedding-ada-002' for OpenAI or 'embedding-001' for Gemini.
OLLAMA_BASE_URL=http://localhost:11434 # Only needed if using Ollama for local embeddings/LLMs
REFRESH_SECRET=a_very_secret_key_for_cron_jobs # Secret key to authorize the RAG refresh endpoint
```

### 3. Run with Docker Compose

A helper script `start.sh` is provided to simplify environment management.

```bash
# Start the app, ChromaDB, and rebuild containers (Ollama is excluded by default)
./start.sh --build

# To include the local Ollama service
./start.sh --build --with-local-llm

# To force a full prune of the Docker system before starting
./start.sh --prune --yes --build
```

**Note:** The first time you run this, Ollama will download the `nomic-embed-text` model (or your specified embedding model). This might take some time depending on your internet connection.

### 4. Access the Application

Once the services are up and running, open your browser and navigate to:

```
http://localhost:3000
```

### 5. Ingest Documents

Use the "Upload Document" button in the top navigation bar to open the document upload modal. You can upload PDF or text files, or provide a URL. These documents will be processed, chunked, embedded, and stored in your local ChromaDB instance, making them available for RAG.
 
### 6. Interact with the Concierge

Start a chat and ask questions. The Concierge agent will automatically retrieve relevant information from your uploaded documents (if available) to provide more accurate and context-rich responses.

### 7. Periodically Refresh URL-based Documents

To keep the knowledge base up-to-date, you can set up a cron job to periodically re-scrape and update documents that were ingested from URLs.

A secure API endpoint is available at `/api/rag/refresh`. This endpoint is protected by the `REFRESH_SECRET` environment variable.

You can trigger this endpoint using a `POST` request with the secret key in the Authorization header.

**Example using `curl`:**
```bash
curl -X POST -H "Authorization: Bearer your_refresh_secret_here" https://your-app-url.com/api/rag/refresh
```

## Deployment to Vercel

For Vercel deployment, the Next.js application can be deployed directly. However, for the RAG functionality, ChromaDB (and Ollama for local embeddings) would need to be hosted externally. You can configure `CHROMA_DB_URL` and `EMBEDDING_MODEL_NAME` to point to a hosted ChromaDB instance and a remote embedding service (e.g., OpenAI's embedding API) respectively.

## Project Structure

- `app/`: Next.js App Router pages and API routes.
  - `api/ingest/route.ts`: API endpoint for document ingestion.
  - `api/rag/refresh/route.ts`: API endpoint for periodically refreshing URL-based documents.
- `components/`: React components.
  - `DocumentUploadModal.tsx`: UI for uploading documents/URLs.
  - `TopNav.tsx`: Main navigation, includes the "Upload Document" button.
- `lib/`: Core logic and utilities.
  - `agents/conciergeAgent.ts`: The main orchestrating agent.
  - `agents/ragAssistant.ts`: Handles context retrieval from ChromaDB.
    - `rag/chroma.ts`: ChromaDB client and collection utilities.
  - `rag/documentProcessor.ts`: Handles parsing, chunking, embedding, and storing documents. (Note: The actual file is `lib/rag/documentProcessor.ts`)
  - `embeddings.ts`: Abstraction for embedding model selection (Ollama/OpenAI/Gemini). (Note: The actual file is `lib/embeddings.ts`)
  - `llm.ts`: Abstraction for LLM chat model selection. (Note: The actual file is `lib/llm.ts`)
  - `store.ts`: Zustand store for managing UI state (e.g., modal visibility).
- `docker-compose.yml`: Defines the multi-service Docker environment.
- `.env.local.example`: Example environment variables.

## Required Packages

- `ai`: Vercel AI SDK for the chat UI.
- `chromadb`: TypeScript client for ChromaDB.
- `langchain` & `@langchain/*`: Core framework for agents, tools, and LLM integrations.
- `pdf-parse`: For parsing PDF files.
- `zustand`: For simple global state management (e.g., modal visibility).

To install these, run:
```bash
npm install
```

## Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests.

## License

This project is licensed under the MIT License.