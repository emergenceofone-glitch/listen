import { ai } from '../src/ai/genkit';

async function testPromptLoad() {
    try {
        console.log('Attempting to load prompt "daystrom"...');
        const prompt = ai.prompt('daystrom');
        console.log('Prompt object:', prompt);
        console.log('Prompt successfully reference acquired (note: this does not guarantee it is registered until termed).');

        // Try to verify if it's executable or just a reference wrapper
        // In some SDK versions, ai.prompt('name') returns a callable wrapper even if it doesn't exist yet, 
        // and fails when called. But let's see what we get.

    } catch (e) {
        console.error('Error loading prompt:', e);
    }
}

testPromptLoad();
