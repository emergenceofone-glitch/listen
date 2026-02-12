import { xai } from '@ai-sdk/xai';
import { generateText } from 'ai';

/**
 * A direct implementation using the Vercel AI SDK and xAI provider.
 * This can be used outside of the Genkit framework.
 */
export async function quickGrokAsk(prompt: string) {
  const { text } = await generateText({
    model: xai('grok-2-1212'),
    prompt: prompt,
  });

  return text;
}
