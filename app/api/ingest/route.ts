import { NextRequest, NextResponse } from 'next/server';
import { getPineconeClient, chunkText, getEmbeddings } from '@/lib/rag';
import { PineconeRecord } from '@pinecone-database/pinecone';

export async function POST(req: NextRequest) {
    try {
        const { text, metadata } = await req.json();
        if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

        // 1. Chunk
        const chunks = await chunkText(text);
        const chunkTexts = chunks.map(c => c.pageContent);

        // 2. Embed
        const embeddings = await getEmbeddings(chunkTexts);

        // 3. Upsert
        const pinecone = getPineconeClient();
        const indexName = process.env.PINECONE_INDEX_NAME!;
        const index = pinecone.Index(indexName);

        const records: PineconeRecord[] = chunks.map((chunk, i) => ({
            id: `${Date.now()}-${i}`,
            values: embeddings[i],
            metadata: {
                ...metadata,
                text: chunk.pageContent,
                chunkIndex: i,
                totalChunks: chunks.length,
                source: metadata?.source || 'user-input'
            }
        }));

        await index.upsert(records);

        return NextResponse.json({ success: true, chunks: chunks.length });
    } catch (error: any) {
        console.error("Ingest Error:", error);
        return NextResponse.json({ error: error.message || 'Ingest failed' }, { status: 500 });
    }
}
