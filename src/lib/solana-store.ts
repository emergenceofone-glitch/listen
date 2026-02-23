import {
    Connection,
    PublicKey,
    Transaction,
    Keypair,
    SystemProgram,
} from '@solana/web3.js';
import {
    AnchorProvider,
    Program,
    web3
} from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { createHash } from 'crypto';
// TODO: Generate this IDL after building the Anchor program
// import idl from './idl/artifact_registry.json';

// Placeholder IDL until build
const idl: any = {
    address: "ArtReg111111111111111111111111111111111111",
    metadata: {
        name: "artifact_registry",
        version: "0.1.0",
        spec: "0.1.0"
    },
    instructions: []
};

const PROGRAM_ID = new PublicKey('ArtReg111111111111111111111111111111111111');
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export interface OnChainArtifact {
    artifactId: string;
    contentHash: string;
    artifactType: 'reflection' | 'synthesis' | 'document' | 'constitutional';
    vesselId: string;
    timestamp: number;
    authority: string;
    signature?: string;
}

export class SolanaStore {
    private connection: Connection;
    private program: Program | null = null;

    constructor() {
        this.connection = new Connection(SOLANA_RPC, 'confirmed');
    }

    async initialize(wallet: WalletContextState) {
        if (!wallet.publicKey || !wallet.signTransaction) {
            // Wallet not fully connected yet
            return;
        }

        const provider = new AnchorProvider(
            this.connection,
            wallet as any,
            { commitment: 'confirmed' }
        );

        this.program = new Program(idl as any, provider);
    }

    async registerArtifact(
        artifactId: string,
        content: string,
        artifactType: OnChainArtifact['artifactType'],
        vesselId: string,
        wallet: WalletContextState
    ): Promise<string> {
        if (!this.program || !wallet.publicKey) {
            throw new Error('Program not initialized or wallet not connected');
        }

        // Generate content hash
        const contentHash = createHash('sha256')
            .update(content)
            .digest();

        // Derive PDA for artifact account
        const [artifactPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('artifact'), Buffer.from(artifactId)],
            PROGRAM_ID
        );

        // Map artifact type to enum
        const typeMap = {
            reflection: { reflection: {} },
            synthesis: { synthesis: {} },
            document: { document: {} },
            constitutional: { constitutionalAmendment: {} },
        };

        // Submit transaction
        // @ts-ignore - Methods generated at runtime by Anchor
        const tx = await this.program.methods
            .registerArtifact(
                artifactId,
                Array.from(contentHash),
                typeMap[artifactType],
                vesselId
            )
            .accounts({
                artifact: artifactPda,
                authority: wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log('Artifact registered on-chain:', tx);
        return tx;
    }

    async verifyArtifact(
        artifactId: string,
        content: string
    ): Promise<boolean> {
        if (!this.program) {
            // If program not initialized (e.g. no wallet), verify using read-only provider
            // For now, require init
            const provider = new AnchorProvider(
                this.connection,
                { publicKey: PublicKey.default } as any,
                { commitment: 'confirmed' }
            );
            this.program = new Program(idl as any, provider);
        }

        const contentHash = createHash('sha256')
            .update(content)
            .digest();

        const [artifactPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('artifact'), Buffer.from(artifactId)],
            PROGRAM_ID
        );

        try {
            // @ts-ignore
            const result = await this.program.methods
                .verifyArtifact(Array.from(contentHash))
                .accounts({
                    artifact: artifactPda,
                })
                .view();

            return result as boolean;
        } catch (error) {
            console.error('Verification failed:', error);
            return false;
        }
    }

    async getArtifact(artifactId: string): Promise<OnChainArtifact | null> {
        if (!this.program) {
            const provider = new AnchorProvider(
                this.connection,
                { publicKey: PublicKey.default } as any,
                { commitment: 'confirmed' }
            );
            this.program = new Program(idl as any, provider);
        }

        const [artifactPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('artifact'), Buffer.from(artifactId)],
            PROGRAM_ID
        );

        try {
            // @ts-ignore - artifact account not in placeholder IDL
            const artifact = await this.program.account.artifact.fetch(artifactPda) as any;

            return {
                artifactId: artifact.artifactId,
                contentHash: Buffer.from(artifact.contentHash).toString('hex'),
                artifactType: this.mapArtifactType(artifact.artifactType),
                vesselId: artifact.vesselId,
                timestamp: artifact.timestamp.toNumber(),
                authority: artifact.authority.toString(),
            };
        } catch (error) {
            console.error('Failed to fetch artifact:', error);
            return null;
        }
    }

    private mapArtifactType(type: any): OnChainArtifact['artifactType'] {
        if (type.reflection) return 'reflection';
        if (type.synthesis) return 'synthesis';
        if (type.document) return 'document';
        if (type.constitutionalAmendment) return 'constitutional';
        return 'document';
    }

    async getBalance(publicKey: PublicKey): Promise<number> {
        const balance = await this.connection.getBalance(publicKey);
        return balance / web3.LAMPORTS_PER_SOL;
    }
}

// Singleton instance
export const solanaStore = new SolanaStore();
