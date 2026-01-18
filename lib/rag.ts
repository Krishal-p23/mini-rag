import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import { CohereClient } from 'cohere-ai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// Initialize clients
export const getPineconeClient = () => {
    if (!process.env.PINECONE_API_KEY) throw new Error("Missing PINECONE_API_KEY");
    return new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });
};

export const getGeminiClient = () => {
    if (!process.env.GOOGLE_API_KEY) throw new Error("Missing GOOGLE_API_KEY");
    return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
};

export const getCohereClient = () => {
    if (!process.env.COHERE_API_KEY) throw new Error("Missing COHERE_API_KEY");
    return new CohereClient({
        token: process.env.COHERE_API_KEY,
    });
};

export const chunkText = async (text: string, chunkSize: number = 800, chunkOverlap: number = 100) => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
    });
    return await splitter.createDocuments([text]);
};

export const getEmbeddings = async (texts: string[]) => {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: "text-embedding-004" });

    // Gemini only allows 100 requests per batch
    const batchSize = 100;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const result = await model.batchEmbedContents({
            requests: batch.map(t => ({
                content: { role: "user", parts: [{ text: t }] },
                taskType: TaskType.RETRIEVAL_DOCUMENT
            }))
        });
        if (result.embeddings) {
            allEmbeddings.push(...result.embeddings.map(e => e.values));
        }
    }
    return allEmbeddings;
};

export const getQueryEmbedding = async (query: string) => {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent({
        content: { role: "user", parts: [{ text: query }] },
        taskType: TaskType.RETRIEVAL_QUERY
    });
    return result.embedding.values;
};
