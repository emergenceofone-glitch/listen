const { config } = require('dotenv');
const path = require('path');

// Load .env.local from the root directory
config({ path: path.resolve(process.cwd(), '.env.local') });

// Verify env vars
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
    process.exit(1);
}

const { VesselStore, ProjectStore } = require('../src/lib/nexus-store');

async function seed() {
    console.log('--- Starting Genesis Seed ---');
    console.log('Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    try {
        console.log('Seeding Vessels...');
        const vessels = await VesselStore.seedGenesisBatch();
        console.log(`Successfully seeded ${vessels.length} vessels.`);

        console.log('Seeding Initial Projects...');
        await ProjectStore.seedInitialProjects();
        console.log('Successfully seeded initial projects.');

        console.log('--- Genesis Seed Complete ---');
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

seed();