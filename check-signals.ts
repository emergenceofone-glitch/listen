
import { VCPStore } from './src/lib/nexus-store';

async function check() {
    try {
        const pending = await VCPStore.getPending();
        console.log('Pending Signals:', JSON.stringify(pending, null, 2));
    } catch (error) {
        console.error('Error checking signals:', error);
    }
}

check();
