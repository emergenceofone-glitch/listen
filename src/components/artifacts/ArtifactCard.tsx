'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { solanaStore } from '@/lib/solana-store';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Artifact } from '@/lib/nexus-store';

interface ArtifactCardProps {
    artifact: Artifact;
    expanded: boolean;
    onExpand: () => void;
}

export function ArtifactCard({
    artifact,
    expanded,
    onExpand
}: ArtifactCardProps) {
    const wallet = useWallet();
    const [registering, setRegistering] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState<boolean | null>(null);

    // Cast artifact type to match expected types or default to 'document'
    const artifactType = (['reflection', 'synthesis', 'document', 'constitutional'].includes(artifact.category)
        ? artifact.category
        : 'document') as any;

    // Placeholder for on-chain data (mock for now until DB update)
    const onChainSignature = (artifact as any).on_chain_signature;

    const handleRegister = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!wallet.connected) {
            alert('Please connect your wallet first');
            return;
        }

        setRegistering(true);
        try {
            const signature = await solanaStore.registerArtifact(
                artifact.id,
                artifact.content,
                artifactType,
                (artifact as any).vessel_id || 'unknown',
                wallet
            );

            console.log('Registered with signature:', signature);
            alert(`Artifact registered on-chain!\nSignature: ${signature}`);

            // Ideally update local state/DB here
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Failed to register artifact on-chain');
        } finally {
            setRegistering(false);
        }
    };

    const handleVerify = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setVerifying(true);
        try {
            const isValid = await solanaStore.verifyArtifact(artifact.id, artifact.content);
            setVerified(isValid);
        } catch (error) {
            console.error('Verification failed:', error);
            setVerified(false);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div
            onClick={onExpand}
            className={`glass-panel hover:border-[var(--neon-purple)] transition-all cursor-pointer ${expanded ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="font-medium text-[var(--text-primary)]">{artifact.title}</div>
                    <div className="text-xs text-[var(--text-muted)]">{new Date(artifact.created_at).toLocaleDateString()}</div>
                </div>

                {onChainSignature && (
                    <div className="flex items-center gap-2 text-green-400" title="Secured on Solana Blockchain">
                        <Shield className="w-4 h-4" />
                    </div>
                )}
            </div>

            <div className={`text-sm text-[var(--text-secondary)] ${expanded ? 'whitespace-pre-wrap' : 'line-clamp-3'}`}>
                {artifact.content}
            </div>

            {expanded && artifact.summary && (
                <div className="mt-3 p-3 bg-[rgba(0,0,0,0.2)] rounded-lg text-sm italic text-[var(--text-muted)]">
                    &quot;{artifact.summary}&quot;
                </div>
            )}

            <div className="flex gap-2 mt-4 flex-wrap items-center justify-between">
                <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-[rgba(0,240,255,0.1)] text-[var(--neon-blue)]">{artifact.category}</span>
                    {artifact.tags?.map((t) => (
                        <span key={t} className="text-xs px-2 py-1 rounded-full bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)]">{t}</span>
                    ))}

                    {/* Solana Actions */}
                    {expanded && (
                        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[rgba(255,255,255,0.1)]">
                            {!onChainSignature && (
                                <button
                                    onClick={handleRegister}
                                    disabled={registering || !wallet.connected}
                                    className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 rounded-md text-xs flex items-center gap-1 transition-colors"
                                    title="Register on Solana Blockchain"
                                >
                                    {registering ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                                    {registering ? 'Signing...' : 'Register'}
                                </button>
                            )}

                            {onChainSignature && (
                                <button
                                    onClick={handleVerify}
                                    disabled={verifying}
                                    className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-md text-xs flex items-center gap-1 transition-colors"
                                >
                                    {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                    {verifying ? 'Verifying...' : 'Verify'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {verified !== null && expanded && (
                        <span className={`text-xs flex items-center gap-1 ${verified ? 'text-green-400' : 'text-red-400'}`}>
                            {verified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {verified ? 'On-Chain Verified' : 'Verification Failed'}
                        </span>
                    )}
                    {expanded ? (
                        <span className="text-xs text-[var(--text-muted)]">Click to collapse</span>
                    ) : (
                        <span className="text-xs text-[var(--text-muted)]">Click to expand</span>
                    )}
                </div>
            </div>
        </div>
    );
}
