# AiDevOps - AI Operations Management Dashboard

AiDevOps is a Next.js App Router dashboard designed for AI Operations Management, featuring a multi-provider LLM system, chat UI, quick action cards, and integrated Retrieval-Augmented Generation (RAG) with Pinecone.

## Features

- **Next.js App Router:** Modern and performant React framework.
- **Multi-provider LLM Support:** Seamlessly switch between OpenAI, Gemini, and local Ollama models.
- **Interactive Chat UI:** Engage with AI assistants for various tasks.
- **Quick Action Cards:** Streamlined access to common operations.
- **Cloud-Native RAG with Pinecone:** Enhance AI responses with context from your own documents using a scalable, production-ready vector store.
- **Document Upload:** Easily ingest PDFs, text files, and URLs into your knowledge base.
- **Simplified UI:** Built with plain Tailwind CSS to remain lightweight and avoid heavy component library dependencies.
- **Agentic Architecture:** Concierge acts as an administrator, coordinating specialized assistants.
- **Docker-Compose Setup:** Run the entire application stack (Next.js, local Ollama) with a single command.

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
cp .env.example .env.local
```

Edit `.env.local` and configure your LLM API keys and RAG settings:

```
# LLM Provider Configuration (Example for OpenAI)
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# GOOGLE_API_KEY=your_gemini_api_key_here

# Pinecone Configuration
PINECONE_API_KEY="your-pinecone-api-key-here"
PINECONE_INDEX="your-pinecone-index-name"

# Embedding Model Configuration
EMBEDDING_MODEL_NAME=nomic-embed-text # Recommended for local RAG with Ollama. Can be 'text-embedding-ada-002' for OpenAI or 'embedding-001' for Gemini.
OLLAMA_BASE_URL=http://localhost:11434 # Only needed if using Ollama for local embeddings/LLMs
```

### 3. Run with Docker Compose

A helper script `start.sh` is provided to simplify environment management.

```bash
# Start the app and rebuild containers (Ollama is excluded by default)
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

Use the "Upload Document" button in the top navigation bar to open the document upload modal. You can upload PDF or text files, or provide a URL. These documents will be processed, chunked, embedded, and stored in your Pinecone index, making them available for RAG.
 
### 6. Interact with the Concierge Agent

Start a chat and ask questions (e.g., "Summarize the key points from the document about project phoenix"). The Concierge agent will automatically use its tools (like the Knowledge Base Retriever or Web Search) to find relevant information and answer your query.

## Deployment to Vercel

For Vercel deployment, the Next.js application can be deployed directly. You will need to configure the `PINECONE_API_KEY`, `PINECONE_INDEX`, and your chosen LLM provider API keys in the Vercel project's environment variables.

## Project Structure

- `app/`: Next.js App Router pages and API routes.
  - `api/chat/route.ts`: Main endpoint for handling conversations with the Concierge agent.
  - `api/ingest/route.ts`: Endpoint for document ingestion, handled by the Task Assistant.
- `components/`: React components.
  - `DocumentUploadModal.tsx`: UI for uploading documents/URLs.
  - `TopNav.tsx`: Main navigation, includes the "Upload Document" button.
- `lib/`: Core logic and utilities.
  - `agents/conciergeAgent.ts`: The main orchestrating agent.
  - `agents/ragAssistant.ts`: Handles context retrieval from the vector store.
  - `vectorStore.ts`: Pinecone vector store integration.
  - `embeddings.ts`: Abstraction for embedding model selection (Ollama/OpenAI/Gemini).
  - `llm.ts`: Abstraction for LLM chat model selection.
  - `store.ts`: Zustand store for managing UI state (e.g., modal visibility).
- `docker-compose.yml`: Defines the multi-service Docker environment.
- `.env.local.example`: Example environment variables.

## Required Packages

- `ai`: Vercel AI SDK for the chat UI.
- `@pinecone-database/pinecone`: Official Pinecone client.
- `@langchain/pinecone`: LangChain integration for Pinecone.
- `langchain` & `@langchain/*`: Core framework for agents, tools, and LLM integrations.
- `pdf-parse`: For parsing PDF files.
- `zustand`: For simple global state management (e.g., modal visibility).
- `@playwright/test`: For end-to-end testing.

To install these, run:
```bash
npm install --legacy-peer-deps
```

**Important:** The `--legacy-peer-deps` flag is required because LangChain dependencies have broad peer version ranges that may conflict with other packages in the dependency tree. This flag allows npm to proceed with installation despite these version mismatches—this is safe and expected for this project.

If using `npm ci` in CI/CD pipelines, use:
```bash
npm ci --legacy-peer-deps
```

## Build & Deployment

### Local Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### End-to-End Testing

```bash
npm run test:e2e
```

## Troubleshooting

### Build Fails with Missing Dependencies

Ensure you've installed dependencies with the `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

### Document Upload Not Working

1. Verify you have set `PINECONE_API_KEY` and `PINECONE_INDEX` in your `.env.local` file.
2. Ensure your Pinecone index is created and has the correct dimension for your chosen embedding model.
   - `text-embedding-ada-002` (OpenAI): **1536**
   - `nomic-embed-text` (Ollama): **768**
   - `embedding-001` (Gemini): **768**
3. Ensure your embedding model is configured correctly (`EMBEDDING_MODEL_NAME`).

### Modal Doesn't Open

If the document upload modal doesn't appear when clicking "Upload Document", check:
- TopNav component is marked as a client component (`'use client'` at the top of the file).
- `lib/store.ts` is also marked as a client component (it is—required for Zustand hooks).

## Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests.

## License

This project is licensed under the MIT License.