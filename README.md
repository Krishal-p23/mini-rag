# Mini RAG Assistant

Mini RAG Assistant is a lightweight Retrieval-Augmented Generation (RAG) application designed to help users query custom text sources using natural language. It combines modern LLMs with vector search and reranking to deliver grounded, citation-backed answers.

The project focuses on clarity, modular design, and experimentation with RAG pipelines rather than production-scale complexity.

## Key Features
-**Text Ingestion**
Paste raw text, which is automatically chunked, embedded, and stored in a vector database.

- **Natural Language Q&A**
Ask questions in plain English and get context-aware answers from your ingested data.

- **Reranked Retrieval**
Uses a reranking step to improve the relevance of retrieved chunks before generation.

- **Source Citations**
Generated answers include inline references pointing back to the original text chunks.

- **Modern Tech Stack**
Built with Next.js, Tailwind CSS, Pinecone, Google Gemini, and Cohere.

## How it works
1. **Ingestion Pipeline**
   Input Text
   → Chunking
   → Embedding
   → Vector Storage
   
2. **Query Pipeline**
   User Query
   → Embedding
   → Vector Search
   → Reranking
   → Answer Generation
   
## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file using `.env.example` as reference and add your API keys:
   
   ```env
   PINECONE_API_KEY=your_key
   PINECONE_INDEX_NAME=mini-rag
   GOOGLE_API_KEY=your_key
   COHERE_API_KEY=your_key
   ```
   *Make sure the Pinecone index dimension matches the embedding model (e.g., 768 for text-embedding-004).*

4. **Run the App Locally**
   ```bash
   npm run dev
   ```
   Open your browser at http://localhost:3000.

## Evaluation

To validate the system, a small gold dataset was used.

**Test Context:**
A Wikipedia article on *Photosynthesis* ingested into the system.

**Sample Questions**
   1. Primary pigment involved in photosynthesis → Chlorophyll
   2. Location of light-dependent reactions → Thylakoid membranes
   3. Main byproducts → Oxygen and glucose
   4. Calvin Cycle definition → Light-independent reactions in chloroplasts
   5. Organisms that photosynthesize → Plants, algae, cyanobacteria

**Observations**
- Accuracy: 5/5 correct responses
- Latency: ~1–7 seconds per full pipeline run

## 🔍 Retrieval & Reranking Details**
   1. Vector Search: Pinecone (Top-20 results, cosine similarity)
   2. Reranker: Cohere Rerank v3 Multilingual (Top-5)
   3. Chunking Strategy:
         - Chunk size: 800 characters
         - Overlap: 100 characters

## ⚠️ Limitations
1. **Static knowledge base:** Content updates require re-ingestion
2. **Possible hallucinations:** Citations reduce risk but don’t fully eliminate it
3. **Privacy concerns:** No automatic PII detection or redaction
4. **Latency & cost:** Multiple API calls add overhead
5. **Scalability:** Not optimized for large-scale corpora without caching

## 🔧 Design Trade-offs
- **Accuracy vs speed:** Reranking improves relevance but increases response time
- **Chunk size vs precision:** Smaller chunks improve citation accuracy but increase storage cost
- **Vendor convenience vs lock-in:** Managed services simplify development but limit flexibility

---
## 🚧 Future Improvements
- Larger and automated evaluation datasets
- Configurable retrieval and chunking parameters
- Caching and batching for performance
- Incremental document ingestion
- PII detection and safety filters
- End-to-end testing and monitoring
  
---
## Resume:
https://purple-sarajane-55.tiiny.site
