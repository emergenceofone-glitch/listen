import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { xAI } from '@genkit-ai/compat-oai/xai';

/**
 * Initializes the Genkit framework and exports the configured `ai` object.
 */
export const ai = genkit({
  plugins: [
    googleAI({ apiVersion: 'v1beta' }), // Specify the API version if needed
    xAI(),
  ],
  model: googleAI.model('gemini-1.5-flash'),
  promptDir: 'src/ai/prompts',
});