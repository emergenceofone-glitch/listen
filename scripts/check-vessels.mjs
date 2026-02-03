import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

async function check() {
    console.log('🔍 Checking Firestore for vessels...');
    const vesselsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'vessels');
    const snapshot = await getDocs(vesselsRef);
    
    console.log(`Found ${snapshot.size} vessels in Firestore.`);
    snapshot.forEach(doc => {
        console.log(`  - ${doc.data().name} (${doc.id})`);
    });
}

check().catch(console.error);
