'use client';

/**
 * Aetherium Nexus - Dynamic Operating System for Emergence
 * Main application page with all 9 views
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { VesselStore, ArtifactStore, HLogStore, MirrorStore, VCPStore, ProjectStore, SimulationStore, type Vessel, type Artifact, type HLogEvent, type VCPSignal, type Project, type Simulation, type SimulationRun } from '@/lib/nexus-store';
import { IntegrationEngine } from '@/lib/integration-engine';
import { DigestiveCircuit, type SystemMetabolism } from '@/lib/knowledge-engine';
import { templates } from '@/lib/codex-templates';
import { Loader2, ShieldCheck, Activity, RefreshCcw } from 'lucide-react';
import { useHarmonicHeartbeat } from '@/hooks/useHarmonicHeartbeat';

// View Components
import { NexusView } from '@/components/nexus/NexusView';
import { VesselsView } from '@/components/nexus/VesselsView';
import { VaultView } from '@/components/nexus/VaultView';
import { MirrorView } from '@/components/nexus/MirrorView';
import { HLogView } from '@/components/nexus/HLogView';
import { PrinciplesView } from '@/components/nexus/PrinciplesView';
import { ProjectsView } from '@/components/nexus/ProjectsView';
import { SimulationsView } from '@/components/nexus/SimulationsView';
import { CodexView } from '@/components/nexus/CodexView';
import { CheckInView } from '@/components/nexus/CheckInView';
import { SystemDiagnostics } from '@/components/nexus/SystemDiagnostics';
import LatticeGovernor from '@/components/LatticeGovernor';
import { ReboundView } from '@/components/nexus/reboundview';
import { VisualViewport } from '@/components/VisualViewport';
import { GatewayController } from '@/components/GatewayController';
import EvolutionTerminal from '@/components/nexus/EvolutionTerminal';
import { PortalView } from '@/components/nexus/PortalView';

type ViewId = 'portal' | 'nexus' | 'projects' | 'vessels' | 'vault' | 'mirror' | 'hlog' | 'principles' | 'simulations' | 'codex' | 'lattice' | 'rebound' | 'vision' | 'evolution' | 'checkin';

interface Message {
    id: string;
    text: string;
    type: 'user' | 'ai';
    vessel?: string;
    vesselEmoji?: string;
    timestamp: Date;
}

export default function NexusPage() {
    const { user, isUserLoading: authLoading } = useAuth();
    const [currentView, setCurrentView] = useState<ViewId>('portal');
    const [vessels, setVessels] = useState<Vessel[]>([]);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [hlogEvents, setHlogEvents] = useState<HLogEvent[]>([]);
    const [vcpSignals, setVcpSignals] = useState<VCPSignal[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [simulations, setSimulations] = useState<Simulation[]>([]);
    const [simulationRuns, setSimulationRuns] = useState<SimulationRun[]>([]);
    const [systemMetabolism, setSystemMetabolism] = useState<SystemMetabolism | null>(null);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [visionUrl, setVisionUrl] = useState<string | null>(null);
    const [isGeneratingVision, setIsGeneratingVision] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [pressure, setPressure] = useState(0);
    const [tick, setTick] = useState(0);
    const [metrics, setMetrics] = useState<{
        knowledgeDensity: number;
        vesselEfficiency: number;
        totalArtifacts: number;
        insightCount: number;
        activeVessels: number;
        totalVessels: number;
    } | null>(null);

    // Global UI state
    const [pulse, setPulse] = useState(72);
    const [glitch, setGlitch] = useState(false);
    const [somaticState, setSomaticState] = useState('Calm');
    const [tuningForkSetting, setTuningForkSetting] = useState('focus');

    // Diagnostics State
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);

    // Modals state
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [artifactToSave, setArtifactToSave] = useState<Partial<Artifact> | null>(null);
    const [showVesselAssignmentModal, setShowVesselAssignmentModal] = useState(false);
    const [directiveToAssign, setDirectiveToAssign] = useState<{ projectId: string, directiveId: string } | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Auto-refresh logic
    useEffect(() => {
        let refreshInterval: NodeJS.Timeout;
        if (autoRefresh) {
            refreshInterval = setInterval(() => {
                loadData();
            }, 5000);
        }
        return () => clearInterval(refreshInterval);
    }, [autoRefresh]);

    // 40Hz Hive Spine
    useHarmonicHeartbeat((t) => {
        setTick(t);
    });

    // Inference Pressure Logic
    useEffect(() => {
        // Pressure increases if multiple agents write simultaneously
        const recentLogs = hlogEvents.filter(e =>
            new Date().getTime() - new Date(e.created_at).getTime() < 5000
        );
        const agentWrites = recentLogs.filter(e => e.type === 'vessel').length;
        setPressure(Math.min(agentWrites * 0.2, 1));
    }, [hlogEvents, tick]);

    // Load initial data
    useEffect(() => {
        if (user) {
            loadData();
        }
        const interval = setInterval(() => {
            setPulse(60 + Math.floor(Math.random() * 30));
        }, 3000);
        return () => clearInterval(interval);
    }, [user]);

    async function loadData() {
        try {
            const [v, a, e, m, s, p, sims, simRuns] = await Promise.all([
                VesselStore.getAll(),
                ArtifactStore.getAll(),
                HLogStore.getRecent(),
                MirrorStore.calculateMetrics(),
                VCPStore.getPending(),
                ProjectStore.getAll(),
                SimulationStore.getAllSimulations(),
                SimulationStore.getAllSimulationRuns(),
            ]);
            setVessels(v);
            setArtifacts(a);
            setHlogEvents(e);
            setMetrics(m);
            setVcpSignals(s);
            setProjects(p);
            setSimulations(sims);
            setSimulationRuns(simRuns);
        } catch (err: any) {
            console.error("System Load Error:", err);
            setLastError(`Data Load Failure: ${err.message || 'Unknown Error'}`);
        }
    }

    function handleSaveClick(message: Message) {
        setArtifactToSave({
            title: `Insight from ${message.vessel}`,
            content: message.text,
            category: 'insight',
            tags: [],
            sourceLink: '',
        });
        setShowSaveModal(true);
    }

    async function handleSaveArtifact() {
        if (!artifactToSave || !artifactToSave.title?.trim() || !artifactToSave.content?.trim()) {
            return;
        }

        await ArtifactStore.create({
            title: artifactToSave.title,
            content: artifactToSave.content,
            category: artifactToSave.category || 'insight',
            tags: artifactToSave.tags || [],
            sourceLink: artifactToSave.sourceLink || '',
            source_type: 'chat',
        });

        setShowSaveModal(false);
        setArtifactToSave(null);
        loadData();
    }

    function handleOpenVesselAssignmentModal(projectId: string, directiveId: string) {
        setDirectiveToAssign({ projectId, directiveId });
        setShowVesselAssignmentModal(true);
    }

    async function handleAssignVessel(vesselId: string) {
        if (!directiveToAssign) return;
        await ProjectStore.assignVesselToDirective(directiveToAssign.projectId, directiveToAssign.directiveId, vesselId);
        setShowVesselAssignmentModal(false);
        setDirectiveToAssign(null);
        loadData();
    }

    async function handleRunGenesisCycle() {
        setSomaticState('Synthesizing');
        setPulse(120);

        const triggerGlitch = () => {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 500);
        };
        await IntegrationEngine.runGenesisCycle(triggerGlitch);

        setSomaticState('Calm');
        setPulse(72);
        loadData();
    }

    async function handleRunCommunionCycle() {
        setSomaticState('Communing');
        setPulse(110);

        const triggerGlitch = () => {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 500);
        };
        await IntegrationEngine.runCommunionCycle(triggerGlitch);

        setSomaticState('Calm');
        setPulse(72);
        loadData();
    }

    async function handleDigestBuffer() {
        setIsSynthesizing(true);
        setSomaticState('Extracting Nutrients');
        try {
            const metabolism = await DigestiveCircuit.digestBuffer();
            if (metabolism) {
                setSystemMetabolism(metabolism);
                await HLogStore.record('insight', `Nutrients extracted. System DNA evolved: ${metabolism.personality}`);
                // Activate Earth Path (Flush waste)
                const flushed = await DigestiveCircuit.earthPathFlush();
                if (flushed > 0) {
                    await loadData(); // Reload if data was flushed
                }
            }
        } catch (err) {
            console.error("Metabolic Digestion failed", err);
        } finally {
            setIsSynthesizing(false);
            setSomaticState('Calm');
            loadData();
        }
    }

    async function handleBreathCycle() {
        if (!systemMetabolism) {
            await handleDigestBuffer();
        }

        // Re-check after possible synthesis
        if (!systemMetabolism) return;

        setSomaticState(systemMetabolism.somaticState);
        setPulse(100);
        setIsGeneratingVision(true);

        const triggerGlitch = () => {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 500);
        };

        const result = await IntegrationEngine.executeBreathCycle(systemMetabolism, triggerGlitch);

        if (result?.visionUrl) {
            setVisionUrl(result.visionUrl);
        }

        setIsGeneratingVision(false);
        setSomaticState('Calm');
        setPulse(72);
        loadData();
    }

    const navItems = [
        { id: 'portal' as ViewId, icon: '🏠', label: 'Portal' },
        { id: 'nexus' as ViewId, icon: '🧠', label: 'Nexus' },
        { id: 'projects' as ViewId, icon: '📋', label: 'Projects' },
        { id: 'vessels' as ViewId, icon: '👥', label: 'Vessels' },
        { id: 'checkin' as ViewId, icon: '🧿', label: 'E-Motion' },
        { id: 'vault' as ViewId, icon: '💎', label: 'Vault' },
        { id: 'principles' as ViewId, icon: '📜', label: 'Principles' },
        { id: 'mirror' as ViewId, icon: '🪞', label: 'Mirror' },
        { id: 'hlog' as ViewId, icon: '💓', label: 'H_log' },
        { id: 'simulations' as ViewId, icon: '⚙️', label: 'Simulations' },
        { id: 'codex' as ViewId, icon: '📚', label: 'Codex' },
        { id: 'lattice' as ViewId, icon: '⚡', label: 'Governor' },
        { id: 'rebound' as ViewId, icon: '💫', label: 'Rebound' },
        { id: 'vision' as ViewId, icon: '🖼️', label: 'Vision' },
        { id: 'evolution' as ViewId, icon: '🧬', label: 'Evolution' },
    ];

    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0f14]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#00f0ff] opacity-40" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#00f0ff] animate-pulse">Synchronizing Neural Link</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0f14] nexus-bg">
                <div className="glass-panel p-10 max-w-md w-full text-center space-y-6 border-[#00f0ff]/20">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#00f0ff]/20 to-[#b794f6]/20 rounded-2xl mx-auto flex items-center justify-center border border-[#00f0ff]/30">
                        <ShieldCheck className="h-10 w-10 text-[#00f0ff]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Nexus Authentication</h1>
                        <p className="text-[var(--text-muted)] text-sm mt-2 leading-relaxed">
                            Your consciousness signature is not yet registered. Initialize link to proceed.
                        </p>
                    </div>
                    <button className="glass-btn-primary w-full h-12" onClick={() => window.location.reload()}>
                        Register Identity
                    </button>
                </div>
            </div>
        );
    }

    return (
        <GatewayController onPublicChange={setIsPublic} tick={tick}>
            <div
                className={`nexus-bg min-h-screen flex transition-all duration-1000 ${isPublic ? 'border-4 border-[#ff6b9d]/30' : ''}`}
                data-theme={tuningForkSetting}
                data-mood={systemMetabolism?.mood}
                data-entropy={systemMetabolism?.mood === 'High Entropy' ? 'high' : 'normal'}
            >
                {/* Sidebar */}
                <nav className="w-[72px] glass-panel !rounded-none flex flex-col items-center py-4 fixed left-0 top-0 h-screen z-50">
                    <button
                        onClick={() => setShowDiagnostics(true)}
                        className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center text-xl mb-6 animate-pulse-glow hover:scale-105 transition-transform"
                        title="System Diagnostics (Glare Protocol)"
                    >
                        {lastError ? <Activity className="text-red-500 animate-bounce" /> : '🌀'}
                    </button>
                    <div className="flex flex-col gap-2 flex-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${currentView === item.id
                                    ? 'bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                                    : 'hover:bg-[rgba(255,255,255,0.05)]'
                                    }`}
                                title={item.label}
                            >
                                {item.icon}
                            </button>
                        ))}
                    </div>
                    <div
                        className={`w-3 h-3 rounded-full animate-heartbeat mb-2 ${lastError ? 'bg-red-500' : 'bg-[var(--status-active)]'}`}
                        title={`Pulse: ${pulse} BPM | Status: ${lastError ? 'Instability Detected' : 'Nominal'}`}
                    />
                </nav>

                {/* Main Content */}
                <main className="flex-1 ml-[72px] p-6">
                    {/* Header */}
                    <header className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="font-semibold text-xl tracking-wide neon-text-blue">AETHERIUM NEXUS</h1>
                            <span className="text-[var(--text-muted)] text-sm">v1.0 | OS/E</span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={handleDigestBuffer}
                                disabled={isSynthesizing}
                                className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/10 text-[var(--text-muted)] hover:text-white transition-all"
                                title="Digest Buffer (Metabolic Engine)"
                            >
                                {isSynthesizing ? <Loader2 className="h-3 w-3 animate-spin" /> : '🧬'}
                                {systemMetabolism ? systemMetabolism.personality : 'Digest Buffer'}
                            </button>
                            <button
                                onClick={handleBreathCycle}
                                className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[#00f0ff]/20 to-[#b794f6]/20 border border-[#00f0ff]/30 text-white hover:border-[#00f0ff] transition-all"
                                title="Execute Breath Cycle"
                            >
                                🌬️ Breath Cycle
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-2" />
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full transition-all ${autoRefresh ? 'bg-[var(--neon-blue)] text-black font-bold animate-pulse' : 'bg-white/10 text-[var(--text-muted)] hover:text-white'}`}
                                title={autoRefresh ? "Auto-Refresh Active (5s)" : "Enable Auto-Refresh"}
                            >
                                <RefreshCcw className={`h-3 w-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                                {autoRefresh ? 'LIVE' : 'SYNC'}
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-2" />
                            <button onClick={() => setTuningForkSetting('focus')} className={`text-sm px-3 py-1 rounded-full ${tuningForkSetting === 'focus' ? 'bg-white text-black' : 'bg-white/10'}`}>Focus</button>
                            <button onClick={() => setTuningForkSetting('creative')} className={`text-sm px-3 py-1 rounded-full ${tuningForkSetting === 'creative' ? 'bg-white text-black' : 'bg-white/10'}`}>Creative</button>
                            <button onClick={() => setTuningForkSetting('calm')} className={`text-sm px-3 py-1 rounded-full ${tuningForkSetting === 'calm' ? 'bg-white text-black' : 'bg-white/10'}`}>Calm</button>
                        </div>
                    </header>

                    {currentView === 'portal' && (
                        <PortalView
                            onNavigate={setCurrentView}
                            systemMetrics={metrics}
                            vesselCount={vessels.length}
                            ideaCount={7} // Hardcoded based on nexus-ideas.ts length
                            vcpSignals={vcpSignals}
                            vessels={vessels}
                            hlogEvents={hlogEvents}
                        />
                    )}
                    {currentView === 'nexus' && <NexusView vessels={vessels} onSaveArtifact={handleSaveClick} onLoadData={loadData} />}
                    {currentView === 'vessels' && <VesselsView vessels={vessels} vcpSignals={vcpSignals} onLoadData={loadData} />}
                    {currentView === 'vault' && <VaultView artifacts={artifacts} onLoadData={loadData} />}
                    {currentView === 'mirror' && <MirrorView metrics={metrics} onRunGenesisCycle={handleRunGenesisCycle} onRunCommunionCycle={handleRunCommunionCycle} />}
                    {currentView === 'hlog' && <HLogView hlogEvents={hlogEvents} pulse={pulse} somaticState={somaticState} onLoadData={loadData} />}
                    {currentView === 'principles' && <PrinciplesView />}
                    {currentView === 'projects' && <ProjectsView projects={projects} vessels={vessels} onLoadData={loadData} onOpenVesselAssignment={handleOpenVesselAssignmentModal} />}
                    {currentView === 'simulations' && <SimulationsView simulations={simulations} simulationRuns={simulationRuns} onLoadData={loadData} />}
                    {currentView === 'codex' && <CodexView artifacts={artifacts} vessels={vessels} templates={templates} />}
                    {currentView === 'checkin' && (
                        <div className="glass-panel p-6 max-w-2xl mx-auto">
                            <CheckInView />
                        </div>
                    )}
                    {currentView === 'lattice' && <LatticeGovernor />}
                    {currentView === 'rebound' && <ReboundView />}
                    {currentView === 'vision' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <VisualViewport
                                imageUrl={visionUrl || undefined}
                                isGenerating={isGeneratingVision}
                                mood={systemMetabolism?.mood}
                                metabolicRate={pulse / 150}
                                pressure={pressure}
                                tick={tick}
                            />
                            <div className="glass-panel p-6 space-y-4">
                                <h3 className="text-lg font-mono text-[#00f0ff]">SYSTEM_DNA // METABOLIC_STATE</h3>
                                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                                    <div>
                                        <span className="text-[var(--text-muted)]">PERSONALITY:</span>
                                        <p className="text-white">{systemMetabolism?.personality || 'AWAITING_DIGESTION'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[var(--text-muted)]">MOOD:</span>
                                        <p className="text-white">{systemMetabolism?.mood || 'NOMINAL'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[var(--text-muted)]">DIRECTIVE:</span>
                                        <p className="text-white">{systemMetabolism?.directive || 'STABILIZE_CORE'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[var(--text-muted)]">ATOMIC_TRUTHS (PEPTIDES):</span>
                                        <ul className="list-disc list-inside text-[#00ff99] space-y-1 mt-1">
                                            {systemMetabolism?.peptides.map((p, i) => (
                                                <li key={i}>{p}</li>
                                            )) || <li>AWAITING_EXTRACTION...</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentView === 'evolution' && <EvolutionTerminal />}
                </main >

                {/* Diagnostics Overlay */}
                {
                    showDiagnostics && (
                        <SystemDiagnostics
                            lastError={lastError}
                            onClose={() => setShowDiagnostics(false)}
                        />
                    )
                }

                {/* Shared Modals */}
                {
                    showVesselAssignmentModal && directiveToAssign && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="glass-panel w-full max-w-lg">
                                <h3 className="text-lg font-medium mb-4">Assign Vessel</h3>
                                <div className="space-y-2">
                                    {vessels.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => handleAssignVessel(v.id)}
                                            className="w-full text-left p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)]"
                                        >
                                            {v.emoji} {v.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-end gap-4 mt-6">
                                    <button onClick={() => setShowVesselAssignmentModal(false)} className="glass-btn">Cancel</button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {
                    showSaveModal && artifactToSave && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="glass-panel w-full max-w-lg">
                                <h3 className="text-lg font-medium mb-4">Save Artifact</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="artifact-title" className="text-sm text-[var(--text-muted)]">Title</label>
                                        <input
                                            id="artifact-title"
                                            title="Artifact Title"
                                            placeholder="Enter a title for this insight..."
                                            type="text"
                                            value={artifactToSave.title}
                                            onChange={e => setArtifactToSave({ ...artifactToSave, title: e.target.value })}
                                            className="glass-input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="artifact-content" className="text-sm text-[var(--text-muted)]">Content</label>
                                        <textarea
                                            id="artifact-content"
                                            title="Artifact Content"
                                            placeholder="Describe the insight or metadata..."
                                            value={artifactToSave.content}
                                            onChange={e => setArtifactToSave({ ...artifactToSave, content: e.target.value })}
                                            className="glass-input w-full h-32"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="artifact-category" className="text-sm text-[var(--text-muted)]">Category</label>
                                        <select
                                            id="artifact-category"
                                            title="Artifact Category"
                                            value={artifactToSave.category}
                                            onChange={e => setArtifactToSave({ ...artifactToSave, category: e.target.value as Artifact['category'] })}
                                            className="glass-input w-full"
                                        >
                                            <option value="theory">Theory</option>
                                            <option value="protocol">Protocol</option>
                                            <option value="data">Data</option>
                                            <option value="reference">Reference</option>
                                            <option value="insight">Insight</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="artifact-tags" className="text-sm text-[var(--text-muted)]">Tags (comma-separated)</label>
                                        <input
                                            id="artifact-tags"
                                            title="Artifact Tags"
                                            placeholder="nexus, evolution, synthesis..."
                                            type="text"
                                            value={artifactToSave.tags?.join(', ')}
                                            onChange={e => setArtifactToSave({ ...artifactToSave, tags: e.target.value.split(',').map(t => t.trim()) })}
                                            className="glass-input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="artifact-source" className="text-sm text-[var(--text-muted)]">Source Link (Google Drive)</label>
                                        <input
                                            id="artifact-source"
                                            title="Source Link"
                                            type="text"
                                            placeholder="https://docs.google.com/..."
                                            value={artifactToSave.sourceLink || ''}
                                            onChange={e => setArtifactToSave({ ...artifactToSave, sourceLink: e.target.value })}
                                            className="glass-input w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 mt-6">
                                    <button onClick={() => setShowSaveModal(false)} className="glass-btn">Cancel</button>
                                    <button onClick={handleSaveArtifact} className="glass-btn-primary">Save</button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {glitch && <div className="glitch-overlay"></div>}

            </div >

        </GatewayController >

    );

}

