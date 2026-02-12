'use server';

/**
 * @fileOverview Grok Analysis Flow - AI-powered deep analysis using xAI's Grok models.
 * 
 * This flow leverages the xAI Grok models via Genkit to provide sharp, concise, 
 * and highly analytical perspectives on complex queries.
 */

import 'dotenv/config';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GrokAnalysisInputSchema = z.object({
    query: z.string().describe('The complex query or dataset to analyze.'),
    depth: z.enum(['concise', 'balanced', 'exhaustive']).default('balanced').describe('The depth of the analysis.'),
    perspective: z.string().optional().describe('An optional lens or perspective for the analysis (e.g., "ethical", "technical").'),
});

export type GrokAnalysisInput = z.infer<typeof GrokAnalysisInputSchema>;

const GrokAnalysisOutputSchema = z.object({
    analysis: z.string().describe('The detailed analysis from Grok.'),
    keyInsights: z.array(z.string()).describe('A list of critical insights extracted by Grok.'),
    modelUsed: z.string().describe('The specific Grok model that performed the analysis.'),
    timestamp: z.string().describe('When the analysis was generated.')
});

export type GrokAnalysisOutput = z.infer<typeof GrokAnalysisOutputSchema>;

/**
 * Executes a deep analysis using xAI's Grok-2 model.
 */
export const grokAnalysisFlow = ai.defineFlow(
    {
        name: 'grokAnalysisFlow',
        inputSchema: GrokAnalysisInputSchema,
        outputSchema: GrokAnalysisOutputSchema,
    },
    async (input) => {
        // We use the 'xai/grok-2-1212' model which is provided by the xAI plugin
        // Note: You can also use 'xai/grok-beta' or 'xai/grok-2'
        const model = 'xai/grok-2-1212';

        const { text } = await ai.generate({
            model: model,
            prompt: `
                Perform a ${input.depth} analysis of the following query:
                "${input.query}"
                
                ${input.perspective ? `Perspective: ${input.perspective}` : ''}
                
                Provide a structured response with a deep dive analysis followed by key insights.
            `,
        });

        // Simple insight extraction for the demo
        const lines = text.split('\n');
        const insights = lines
            .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
            .map(line => line.trim().replace(/^[-*]\s*/, ''))
            .slice(0, 5);

        return {
            analysis: text,
            keyInsights: insights.length > 0 ? insights : ["Refer to the main analysis for insights."],
            modelUsed: model,
            timestamp: new Date().toISOString()
        };
    }
);
