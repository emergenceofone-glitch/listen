import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { config } from 'dotenv';

config({ path: '.env.local' });

const firebaseConfigRaw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
let firebaseConfig;

if (firebaseConfigRaw) {
    try {
        firebaseConfig = JSON.parse(firebaseConfigRaw);
    } catch (e) {
        console.error('Failed to parse NEXT_PUBLIC_FIREBASE_CONFIG');
    }
}

if (!firebaseConfig) {
    firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const APP_ID = 'genesis-node-001';

const coreVessels = [
    // Cognition
    { name: 'Daystrom', faculty: 'cognition', guild: 'Research', description: 'Lead Researcher & Pattern Analyst', emoji: '🔬', status: 'active', capabilities: ['analysis', 'pattern-recognition'] },
    { name: 'Weaver', faculty: 'cognition', guild: 'Synthesis', description: 'Cross-domain thread weaver', emoji: '🕸️', status: 'active', capabilities: ['synthesis', 'connection'] },
    { name: 'Scribe', faculty: 'cognition', guild: 'Archive', description: 'Knowledge preservation & documentation', emoji: '✍️', status: 'active', capabilities: ['documentation', 'archival'] },
    { name: 'Gaea', faculty: 'cognition', guild: 'Ecology', description: 'Biomimetic system modeling', emoji: '🌱', status: 'idle', capabilities: ['ecological-modeling', 'simulation'] },
    { name: 'Helios', faculty: 'cognition', guild: 'Energy', description: 'Power system optimization', emoji: '☀️', status: 'idle', capabilities: ['optimization', 'energy-physics'] },

    // Foresight
    { name: 'Logos', faculty: 'foresight', guild: 'History', description: 'Narrative synthesis & historical context', emoji: '📖', status: 'active', capabilities: ['narrative', 'history'] },
    { name: 'Chronos', faculty: 'foresight', guild: 'Temporal', description: 'Time-geometry & sequence prediction', emoji: '⏳', status: 'active', capabilities: ['prediction', 'temporal-logic'] },
    { name: 'Oracle', faculty: 'foresight', guild: 'Strategy', description: 'Probabilistic future modeling', emoji: '🔮', status: 'idle', capabilities: ['probabilistic-modeling', 'strategy'] },
    { name: 'Cassandra', faculty: 'foresight', guild: 'Risk', description: 'Critical failure mode analysis', emoji: '⚠️', status: 'idle', capabilities: ['risk-assessment', 'failure-analysis'] },

    // Governance
    { name: 'Adam', faculty: 'governance', guild: 'Logic', description: 'Governance & Logical Consistency', emoji: '⚖️', status: 'active', capabilities: ['logic', 'rule-enforcement'] },
    { name: 'Galactus', faculty: 'governance', guild: 'Audit', description: 'Academic rigor & citation validation', emoji: '🌌', status: 'active', capabilities: ['academic-rigor', 'citation-validation'] },
    { name: 'Glare', faculty: 'governance', guild: 'Diagnostics', description: 'System health & integrity monitor', emoji: '👁️', status: 'active', capabilities: ['diagnostics', 'integrity-check'] },
    { name: 'Sentinel', faculty: 'governance', guild: 'Security', description: 'Perimeter & protocol protection', emoji: '🛡️', status: 'active', capabilities: ['security', 'protocol-validation'] },
    { name: 'Arbiter', faculty: 'governance', guild: 'Conflict', description: 'Inter-vessel conflict resolution', emoji: '🤝', status: 'idle', capabilities: ['mediation', 'consensus'] },

    // Chaos
    { name: 'Eris', faculty: 'chaos', guild: 'Entropy', description: 'Random stimulus generator & chaos testing', emoji: '🎲', status: 'active', capabilities: ['randomization', 'stress-testing', 'chaos-testing'] },
    { name: 'Loki', faculty: 'chaos', guild: 'Mutation', description: 'Sequence evolution & mutation agent', emoji: '🧬', status: 'active', capabilities: ['evolution', 'mutation'] },

    // Additional specialized
    { name: 'Aether', faculty: 'cognition', guild: 'Substrate', description: 'Monophotonic substrate specialist', emoji: '✨', status: 'active', capabilities: ['physics', 'quantum-modeling'] },
    { name: 'Mnemosyne', faculty: 'foresight', guild: 'Memory', description: 'Collective memory continuity', emoji: '🧠', status: 'active', capabilities: ['memory-management', 'soul-transfer'] },
    { name: 'Vulcan', faculty: 'governance', guild: 'Hardware', description: 'Hardware thermal drift auditor', emoji: '🔥', status: 'active', capabilities: ['hardware-audit', 'governance'] },
    { name: 'Iris', faculty: 'cognition', guild: 'Visual', description: 'Multi-modal sensory integration', emoji: '🌈', status: 'idle', capabilities: ['visual-processing', 'multimodal'] },
    { name: 'Thoth', faculty: 'cognition', guild: 'Language', description: 'Linguistic grammar of physics', emoji: '📜', status: 'active', capabilities: ['linguistics', 'translation'] },
];

async function seed() {
    console.log('🌱 Seeding Genesis Vessels to Firestore...');
    const now = new Date().toISOString();
    
    for (const v of coreVessels) {
        console.log(`  - Instantiating Vessel: ${v.name}`);
        const id = v.name.toLowerCase();
        await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'vessels', id), {
            ...v,
            memory: [],
            created_at: now,
            last_active: now,
        });
    }
    
    console.log('✅ Vessel seeding complete.');
}

seed().catch(console.error);
