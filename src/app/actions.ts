import { agentManager } from '../lib/agent-manager';
import { GenerateCodeInput } from '../ai/flows/generate-code';
import { GenerateTestSuiteInput } from '../ai/flows/generate-test-suite';
import { GenerateMultiModalWorkflowInput } from '../ai/flows/generate-multi-modal-workflow';
import { GenerateEnhancedAnalysisInput } from '../ai/flows/generate-enhanced-analysis';
import { GenerateNarrativeInput } from '../ai/flows/generate-narrative';
import { VesselResponseInput } from '../ai/flows/vessel-response';

export async function generateVesselResponseAction(input: VesselResponseInput): Promise<any> {
    return await agentManager.generateVesselResponse(input);
}

export async function generateTestSuiteAction(input: GenerateTestSuiteInput): Promise<any> {
    return await agentManager.generateTestSuite(input);
}
export async function generateMultiModalWorkflowAction(input: GenerateMultiModalWorkflowInput): Promise<any> {
    return await agentManager.generateMultiModalWorkflow(input);
}
export async function generateEnhancedAnalysisAction(input: GenerateEnhancedAnalysisInput): Promise<any> {
    return await agentManager.generateEnhancedAnalysis(input);
}
export async function generateCodeAction(input: GenerateCodeInput): Promise<any> {
    return await agentManager.generateCode(input);
}
export async function generateNarrativeAction(input: GenerateNarrativeInput): Promise<any> {
    return await agentManager.generateNarrative(input);
}
