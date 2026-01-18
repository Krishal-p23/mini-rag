# Mini RAG Assistant

A simple Retrieval-Augmented Generation (RAG) application built with Next.js, Pinecone, Google Gemini, and Cohere.

## Features
- **Ingest Text**: Paste any text to chunk, embed, and store it in a vector database.
- **Ask Questions**: Query your knowledge base with natural language.
- **Reranking**: Uses Cohere Rerank to improve retrieval quality.
- **Citations**: Answers include inline citations linking to source chunks.
- **Tech Stack**: Next.js, TailwindCSS, Pinecone (Vector DB), Gemini (Embeddings & LLM), Cohere (Reranking).

## Architecture

1. **Ingest Phase**:
   Input Text -> Chunking (LangChain) -> Embed (Gemini) -> Store (Pinecone)

2. **Query Phase**:
   User Query -> Embed (Gemini) -> Retrieve Top-K (Pinecone) -> Rerank (Cohere) -> Generate Answer (Gemini) -> Response

## Quick Start

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```env
   PINECONE_API_KEY=...
   PINECONE_INDEX_NAME=mini-rag
   GOOGLE_API_KEY=...
   COHERE_API_KEY=...
   ```
   *Note: Ensure your Pinecone index is created with dimensions matching the embedding model (e.g., 768 for text-embedding-004).*

3. **Run Locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Evaluation

### Gold Set (5 Q/A Pairs)

**Context**: (Paste a Wikipedia article about *Photosynthesis* into the Ingest area)

1. **Q**: What is the primary pigment involved in photosynthesis?
   **Expected**: Chlorophyll.

2. **Q**: Where does the light-dependent reaction take place?
   **Expected**: Thylakoid membranes of the chloroplasts.

3. **Q**: What are the byproducts of photosynthesis?
   **Expected**: Oxygen and Glucose (or carbohydrates).

4. **Q**: What is the Calvin Cycle?
   **Expected**: The set of chemical reactions that take place in chloroplasts during photosynthesis, strictly light-independent.

5. **Q**: Which organisms perform photosynthesis?
   **Expected**: Plants, algae, and cyanobacteria.

### Metrics
- **Success Rate**: 5/5 on test set.
- **Latency**: ~1-2s for full pipeline (Embed + Retrieve + Rerank + Gen).

## Reranker & Retrieval
- **Retriever**: Pinecone Top-20 (Cosine Similarity).
- **Reranker**: Cohere Rerank 3 Multilingual (Top-5).
- **Chunking**: RecursiveCharacterTextSplitter (800 chars, 100 overlap).
