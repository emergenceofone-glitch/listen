'use server';

/**
 * @fileOverview Vessel Response Flow - AI-powered responses with dynamic vessel personas
 * 
 * This flow provides persona-specific AI responses for the Aetherium Nexus chat interface.
 * Each vessel has a unique personality, focus area, and communication style.
 */

import 'dotenv/config';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GENESIS_HISTORY } from '@/lib/emergence/genesisHistory';
import { VectorStore } from '@/lib/rag/vector-store';

// Initialize Vector Store (Lazy load in production, but here we instantiate)
const vectorStore = new VectorStore();

// Note: Prompt personas are now managed in external .prompt.yml files in src/ai/prompts/
const VESSEL_MAPPING: Record<string, string> = {
    global: 'nexus',
    daystrom: 'daystrom',
    logos: 'logos',
    adam: 'adam',
    weaver: 'weaver',
    scribe: 'scribe',
    glare: 'glare',
    galactus: 'galactus',
    eris: 'eris',
    chronos: 'chronos',
    mnemosyne: 'mnemosyne',
    arbiter: 'arbiter',
    cassandra: 'cassandra'
};


const VesselResponseInputSchema = z.object({
    query: z.string().describe('The user query or message to respond to.'),
    vesselId: z.string().describe('The vessel ID to use for persona selection (global, daystrom, logos, adam, weaver, scribe, glare, galactus, eris, chronos, mnemosyne, arbiter, cassandra).'),
    context: z.string().optional().describe('Optional conversation context or relevant background information.'),
    artifacts: z.array(z.string()).optional().describe('Optional list of relevant artifact summaries for context.'),
});

export type VesselResponseInput = z.infer<typeof VesselResponseInputSchema>;

const VesselResponseOutputSchema = z.object({
    response: z.string().describe('The vessel response to the query.'),
    vesselName: z.string().describe('The name of the responding vessel.'),
    vesselEmoji: z.string().describe('The emoji representing the vessel.'),
    suggestedTags: z.array(z.string()).optional().describe('Suggested tags if the response could become an artifact.'),
    resonanceScore: z.number().min(0).max(1).optional().describe('How strongly this response resonates with existing knowledge (0-1).'),
    citations: z.array(z.string()).optional().describe('List of document sources used in the response.')
});

export type VesselResponseOutput = z.infer<typeof VesselResponseOutputSchema>;

export async function generateVesselResponse(
    input: VesselResponseInput
): Promise<VesselResponseOutput> {
    return vesselResponseFlow(input);
}

const vesselResponseFlow = ai.defineFlow(
    {
        name: 'vesselResponseFlow',
        inputSchema: VesselResponseInputSchema,
        outputSchema: VesselResponseOutputSchema,
    },
    async (input) => {
        const promptId = VESSEL_MAPPING[input.vesselId] || 'nexus';

        // RAG RETRIEVAL
        let retrievedArtifacts: string[] = input.artifacts || [];
        let citations: string[] = [];
        try {
            const relevantChunks = await vectorStore.similaritySearch(input.query, 3);
            if (relevantChunks.length > 0) {
                retrievedArtifacts.push(...relevantChunks.map(c => `Source: ${c.source}\nContent: ${c.content}`));
                citations = Array.from(new Set(relevantChunks.map(c => c.source)));
            }
        } catch (e) {
            console.error("RAG Retrieval Failed:", e);
        }

        let historyStr = '';
        if (input.vesselId === 'logos') {
            historyStr = GENESIS_HISTORY.map(h =>
                `[${h.genesisType.toUpperCase()}] ${h.label} (${new Date(h.timestamp).toLocaleDateString()}): ${h.description} (State: ${h.state})`
            ).join('\n');
        }

        // Load and execute the specialized prompt
        const vesselPrompt = ai.prompt(promptId);
        const { text } = await vesselPrompt({
            query: input.query,
            context: input.context,
            artifacts: retrievedArtifacts,
            history: historyStr
        });


        // Calculate a simple resonance score based on response length and structure
        const resonanceScore = Math.min(1, (text?.length || 0) / 1000);

        // Extract potential tags from the response
        const suggestedTags: string[] = [];
        const tagPatterns = ['synthesis', 'analysis', 'pattern', 'insight', 'strategy', 'ethics', 'history'];
        tagPatterns.forEach(tag => {
            if (text?.toLowerCase().includes(tag)) {
                suggestedTags.push(tag);
            }
        });

        return {
            response: text || 'The vessel remains silent. Please try again.',
            vesselName: promptId.charAt(0).toUpperCase() + promptId.slice(1),
            vesselEmoji: '💠', // Placeholder as emoji is now inside prompt if needed, or we can look it up
            suggestedTags: suggestedTags.length > 0 ? suggestedTags : undefined,
            resonanceScore,
            citations: citations.length > 0 ? citations : undefined
        };
    }
);
