'use server';

import { ContextMatrix } from '@/lib/emergence/emergenceTypes';
import { VesselStore, ProjectStore } from '@/lib/nexus-store';
import { agentManager } from '@/lib/agent-manager';
import { GenerateSynthesisInput } from '@/ai/flows/generate-synthesis';
import { VesselReflectionInput } from '@/ai/flows/reflect-vessel';
import { AnalyzeErrorInput } from '@/ai/flows/analyze-error';
import { GenerateSystemPersonalityInput } from '@/ai/flows/generate-system-personality';
import { GenerateLatticeVisionInput } from '@/ai/flows/generate-lattice-vision';
import { DocumentProcessor } from '@/lib/rag/document-processor';
import { VectorStore } from '@/lib/rag/vector-store';
import path from 'path';

export async function runEmergenceCheckInAction(input: ContextMatrix): Promise<any> {
    return await agentManager.calculateEmergenceState(input);
}

export async function generateSynthesisAction(input: GenerateSynthesisInput): Promise<any> {
    return await agentManager.generateSynthesis(input);
}

export async function reflectVesselAction(input: VesselReflectionInput): Promise<any> {
    return await agentManager.reflectVessel(input);
}

export async function analyzeErrorAction(input: AnalyzeErrorInput): Promise<any> {
    return await agentManager.analyzeError(input);
}

export async function generateSystemPersonalityAction(input: GenerateSystemPersonalityInput): Promise<any> {
    return await agentManager.generateSystemPersonality(input);
}

export async function generateLatticeVisionAction(input: GenerateLatticeVisionInput): Promise<any> {
    return await agentManager.generateLatticeVision(input);
}

export async function ingestDocumentsAction() {
    console.log("[RAG] Starting Ingestion...");
    const docsPath = path.resolve(process.cwd(), 'docs');

    const processor = new DocumentProcessor(docsPath);
    const chunks = await processor.processAll();

    const store = new VectorStore();
    store.clear(); // Rebuild from scratch
    await store.addDocuments(chunks);

    return { success: true, count: chunks.length };
}

export async function seedInitialBatchAction() {
    console.log("[System] Seeding Genesis Batch...");
    const vessels = await VesselStore.seedGenesisBatch();
    await ProjectStore.seedInitialProjects();
    return { success: true, vesselCount: vessels.length };
}

export async function bootstrapLatticeAction() {
    console.log("[System] Bootstrapping Lattice...");
    const hlog = await VesselStore.getAll(); // Just a dummy call to ensure connectivity
    return { success: true, message: "Lattice initialized in memory/store" };
}
