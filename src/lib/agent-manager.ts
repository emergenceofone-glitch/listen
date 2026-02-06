/**
 * @fileOverview Agent Manager - Centralized environment for AI-driven functions and flows.
 * 
 * This manager provides a unified interface for interacting with various AI faculties,
 * bridging the gap between raw Genkit flows and the Aetherium application layers.
 */

import { generateCode, GenerateCodeInput } from '@/ai/flows/generate-code';
import { generateTestSuite, GenerateTestSuiteInput } from '@/ai/flows/generate-test-suite';
import { generateMultiModalWorkflow, GenerateMultiModalWorkflowInput } from '@/ai/flows/generate-multi-modal-workflow';
import { generateEnhancedAnalysis, GenerateEnhancedAnalysisInput } from '@/ai/flows/generate-enhanced-analysis';
import { generateNarrative, GenerateNarrativeInput } from '@/ai/flows/generate-narrative';
import { generateSynthesis, GenerateSynthesisInput } from '@/ai/flows/generate-synthesis';
import { reflectVessel, VesselReflectionInput } from '@/ai/flows/reflect-vessel';
import { analyzeError, AnalyzeErrorInput } from '@/ai/flows/analyze-error';
import { generateSystemPersonality, GenerateSystemPersonalityInput } from '@/ai/flows/generate-system-personality';
import { generateLatticeVision, GenerateLatticeVisionInput } from '@/ai/flows/generate-lattice-vision';
import { generateVesselResponse, VesselResponseInput } from '@/ai/flows/vessel-response';
import { emergenceMathFlow } from '@/lib/emergence/emergenceFlow';
import { ContextMatrix } from '@/lib/emergence/emergenceTypes';
import { HLogStore, ProjectStore } from './nexus-store';

/**
 * Agent Manager - Centralized environment for AI-driven functions and flows.
 * 
 * Provides a unified interface for interacting with various AI faculties,
 * bridging the gap between raw Genkit flows and the Aetherium application layers.
 * Implements the Singleton pattern.
 */
export class AgentManager {
    private static instance: AgentManager;

    private constructor() {
        console.log('🌌 AgentManager Environment Initialized');
    }

    /**
     * Retrieves the singleton instance of the AgentManager.
     */
    public static getInstance(): AgentManager {
        if (!AgentManager.instance) {
            AgentManager.instance = new AgentManager();
        }
        return AgentManager.instance;
    }

    /**
     * DISPATCH: General wrapper for AI flow execution with consistent logging and performance tracking.
     * 
     * @param name - The name of the faculty being dispatched.
     * @param input - The input data for the flow.
     * @param flowFn - The actual Genkit flow function to execute.
     */
    private async dispatch<I, O>(name: string, input: I, flowFn: (input: I) => Promise<O>): Promise<O> {
        const startTime = Date.now();
        console.log(`[AgentManager] Dispatching Faculty: ${name}`);

        try {
            const result = await flowFn(input);
            const duration = Date.now() - startTime;
            console.log(`[AgentManager] Faculty ${name} completed in ${duration}ms`);

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`[AgentManager] Error in Faculty ${name} after ${duration}ms:`, error);

            await HLogStore.record('error', `Agent Faculty failure: ${name}`, {
                error: String(error),
                duration,
                inputSummary: typeof input === 'object' ? Object.keys(input || {}) : 'scalar'
            });
            throw error;
        }
    }

    // ============================================
    // CORE FACULTIES
    // ============================================

    /**
     * Generates a conversational response from a vessel.
     */
    public async generateVesselResponse(input: VesselResponseInput) {
        return this.dispatch('vessel-response', input, generateVesselResponse);
    }

    /**
     * Calculates the emergence state based on the context matrix.
     */
    public async calculateEmergenceState(input: ContextMatrix) {
        return this.dispatch('emergence-math', input, emergenceMathFlow);
    }

    /**
     * Synthesizes complex data into insights.
     */
    public async generateSynthesis(input: GenerateSynthesisInput) {
        return this.dispatch('synthesis', input, generateSynthesis);
    }

    /**
     * Performs self-reflection for a vessel.
     */
    public async reflectVessel(input: VesselReflectionInput) {
        return this.dispatch('reflection', input, reflectVessel);
    }

    /**
     * Analyzes system errors and suggests fixes.
     */
    public async analyzeError(input: AnalyzeErrorInput) {
        return this.dispatch('error-analysis', input, analyzeError);
    }

    /**
     * Generates personality traits for the system.
     */
    public async generateSystemPersonality(input: GenerateSystemPersonalityInput) {
        return this.dispatch('personality-design', input, generateSystemPersonality);
    }

    /**
     * Visualizes the current state of the lattice.
     */
    public async generateLatticeVision(input: GenerateLatticeVisionInput) {
        return this.dispatch('lattice-vision', input, generateLatticeVision);
    }

    // ============================================
    // DEVELOPMENT TOOLS
    // ============================================

    /**
     * Generates code snippets based on requirements.
     */
    public async generateCode(input: GenerateCodeInput) {
        return this.dispatch('code-generation', input, generateCode);
    }

    /**
     * Provides enhanced analytical breakdown of a topic.
     */
    public async generateEnhancedAnalysis(input: GenerateEnhancedAnalysisInput) {
        return this.dispatch('enhanced-analysis', input, generateEnhancedAnalysis);
    }

    /**
     * Generates a test suite for a given component.
     */
    public async generateTestSuite(input: GenerateTestSuiteInput) {
        return this.dispatch('test-generation', input, generateTestSuite);
    }

    /**
     * Generates a multi-modal workflow description.
     */
    public async generateMultiModalWorkflow(input: GenerateMultiModalWorkflowInput) {
        return this.dispatch('multimodal-workflow', input, generateMultiModalWorkflow);
    }

    /**
     * Generates creative or descriptive narratives.
     */
    public async generateNarrative(input: GenerateNarrativeInput) {
        return this.dispatch('narrative-generation', input, generateNarrative);
    }

    // ============================================
    // SYSTEM DATA ACCESS
    // ============================================

    /**
     * Queries the project store with optional filters.
     * Replaces the previous mock implementation with real store integration.
     */
    public async queryProjects(queryType: "list_all" | "by_tag" | "by_status" | "by_id", filterValue?: string) {
        console.log(`[AgentManager] Querying projects: ${queryType} (${filterValue})`);

        const projects = await ProjectStore.getAll();

        switch (queryType) {
            case "list_all":
                return projects;
            case "by_tag":
                // Directives might contain tags in the future, currently we check if any directive matches
                return projects.filter(p => p.name.toLowerCase().includes(filterValue?.toLowerCase() || ""));
            case "by_id":
                return projects.find(p => p.id === filterValue);
            case "by_status":
                return projects.filter(p => p.directives.some(d => d.status === filterValue));
            default:
                return projects;
        }
    }
}

export const agentManager = AgentManager.getInstance();
