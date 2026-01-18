import { NextRequest, NextResponse } from 'next/server';
import { getPineconeClient, getQueryEmbedding, getCohereClient, getGeminiClient } from '@/lib/rag';

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    try {
        const { query } = await req.json();
        if (!query) return NextResponse.json({ error: 'No query provided' }, { status: 400 });

        // 1. Embed Query
        const queryEmbedding = await getQueryEmbedding(query);

        // 2. Retrieve (Vector Search)
        const pinecone = getPineconeClient();
        const indexName = process.env.PINECONE_INDEX_NAME!;
        const index = pinecone.Index(indexName);
        const queryResponse = await index.query({
            vector: queryEmbedding,
            topK: 20, // Fetch more for reranking
            includeMetadata: true,
        });

        const matches = queryResponse.matches || [];
        // Extract text and metadata
        const docs = matches.map(m => ({
            text: (m.metadata?.text as string) || "",
            metadata: m.metadata
        }));

        // 3. Rerank
        const cohere = getCohereClient();
        const reranked = await cohere.rerank({
            documents: docs.map(d => ({ text: d.text })), // Rerank based on text content
            query: query,
            topN: 5,
        });

        const topChunks = reranked.results.map(r => ({
            text: docs[r.index].text,
            metadata: docs[r.index].metadata,
            score: r.relevanceScore,
            originalIndex: r.index
        }));

        // 4. Generate Answer
        const gemini = getGeminiClient();
        const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Construct Prompt with Metadata
        const context = topChunks.map((chunk, i) => {
            const sourceInfo = chunk.metadata?.source ? `(Source: ${chunk.metadata.title || chunk.metadata.source})` : '';
            return `[${i + 1}] ${chunk.text} ${sourceInfo}`;
        }).join('\n\n');

        const prompt = `You are a helpful assistant. Use the following context snippets to answer the user's question. 
    If the provided context does not contain enough information to answer the question, return exactly "NO_ANSWER_FOUND".
    Do not try to make up an answer.
    Always cite your sources using square brackets like [1], [2] at the end of sentences.
    
    Context:
    ${context}
    
    Question: ${query}
    
    Answer:`;

        const result = await model.generateContent(prompt);
        const answerText = result.response.text().trim();

        if (answerText === "NO_ANSWER_FOUND") {
            return NextResponse.json({
                answer: null, // UI should handle null answer
                citations: [],
                time: Date.now() - startTime
            });
        }

        return NextResponse.json({
            answer: answerText,
            citations: topChunks,
            time: Date.now() - startTime
        });
    } catch (error: any) {
        console.error("Query Error:", error);
        return NextResponse.json({ error: error.message || 'Query failed' }, { status: 500 });
    }
}
