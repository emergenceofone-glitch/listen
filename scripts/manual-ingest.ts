import 'dotenv/config';
import { DocumentProcessor } from '../src/lib/rag/document-processor';
import { VectorStore } from '../src/lib/rag/vector-store';
import path from 'path';

async function main() {
    console.log("[RAG] Starting Manual Ingestion...");
    const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    console.log("[DEBUG] API KEY source:", process.env.GOOGLE_API_KEY ? "GOOGLE_API_KEY" : "NEXT_PUBLIC_GEMINI_API_KEY");
    console.log("[DEBUG] API KEY length:", apiKey?.length || 0);

    const searchPaths = [
        path.resolve(process.cwd(), 'docs'),
        path.resolve(process.cwd(), 'User Input'),
        path.resolve(process.cwd(), 'packages/aetherium-game'), // Narrowed focus
        path.resolve(process.cwd(), 'src/lib'), // Narrowed focus
        path.resolve(process.cwd(), '.genesis'), // Added genesis docs
    ];

    const store = new VectorStore();
    // store.clear(); // Keep existing to avoid full re-run if possible, or clear for fresh start
    store.clear();

    let totalChunks = 0;

    for (const dirPath of searchPaths) {
        console.log(`[RAG] Scanning directory: ${dirPath}`);
        const processor = new DocumentProcessor(dirPath);

        for await (const fileChunks of processor.processFilesGenerator()) {
            if (fileChunks.length > 0) {
                console.log(`[RAG] Ingesting ${fileChunks.length} chunks from ${fileChunks[0].source}...`);
                await store.addDocuments(fileChunks);
                totalChunks += fileChunks.length;
            }
        }
    }

    console.log(`[RAG] Successfully ingested ${totalChunks} chunks into the vector store.`);
}

main().catch((err) => {
    console.error("[RAG] Ingestion failed:", err);
    process.exit(1);
});
