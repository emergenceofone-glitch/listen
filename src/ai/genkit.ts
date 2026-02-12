import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/google-genai';
import { xAI } from '@genkit-ai/compat-oai/xai';

/**
 * Initializes the Genkit framework and exports the configured `ai` object.
 */
export const ai = genkit({
  plugins: [
    googleAI({ apiVersion: 'v1beta' }), // Specify the API version if needed
    xAI(),
  ],
  model: gemini15Flash,
  promptDir: 'src/ai/prompts',
});