
'use client';

import { useState, useEffect } from 'react';
import { VesselStore, ArtifactStore, HLogStore, MirrorStore, ProjectStore, VCPStore, type Vessel, type Artifact, type HLogEvent, type Project, type VCPSignal } from '@/lib/nexus-store';
import { generateVesselResponse } from '@/ai/flows/vessel-response';
import { WalletButton } from '@/components/solana/WalletButton';
import { ArtifactCard } from '@/components/artifacts/ArtifactCard';
import { VCPSignalWidget } from '@/components/nexus/VCPSignalWidget';
import { EmotionCheckIn } from '@/components/nexus/EmotionCheckIn';
import { EmergenceContext } from '@/lib/emergence/emergenceTypes';

type ViewId = 'nexus' | 'projects' | 'vessels' | 'vault' | 'mirror' | 'hlog' | 'principles';

interface Message {
    id: string;
    text: string;
    type: 'user' | 'ai';
    vessel?: string;
    vesselEmoji?: string;
    timestamp: Date;
}

export default function NexusPage() {
    const [currentView, setCurrentView] = useState<ViewId>('nexus');
    const [vessels, setVessels] = useState<Vessel[]>([]);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [hlogEvents, setHlogEvents] = useState<HLogEvent[]>([]);
    const [vcpSignals, setVcpSignals] = useState<VCPSignal[]>([]);
    const [metrics, setMetrics] = useState<{knowledgeDensity: number; vesselEfficiency: number; totalArtifacts: number; insightCount: number; activeVessels: number; totalVessels: number;} | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedArtifactId, setExpandedArtifactId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Welcome to the Aetherium Nexus. I am the generative core of this Operating System for Emergence.', type: 'ai', vessel: 'The Nexus', vesselEmoji: '🌀', timestamp: new Date() },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [selectedVessel, setSelectedVessel] = useState('global');
    const [isLoading, setIsLoading] = useState(false);
    const [pulse, setPulse] = useState(72);
    const [showCalibrator, setShowCalibrator] = useState(false);

    useEffect(() => {
        loadData();
        const interval = setInterval(() => setPulse(60 + Math.floor(Math.random() * 30)), 3000);
        return () => clearInterval(interval);
    }, []);

    async function loadData() {
        const [v, a, p, e, s, m] = await Promise.all([VesselStore.getAll(), ArtifactStore.getAll(), ProjectStore.getAll(), HLogStore.getRecent(), VCPStore.getPending(), MirrorStore.calculateMetrics()]);
        setVessels(v); setArtifacts(a); setProjects(p); setHlogEvents(e); setVcpSignals(s); setMetrics(m);
    }
    async function sendMessage() {
        if (!inputValue.trim() || isLoading) return;
        const userMessage: Message = { id: crypto.randomUUID(), text: inputValue, type: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]); setInputValue(''); setIsLoading(true);
        try {
            const response = await generateVesselResponse({ query: userMessage.text, vesselId: selectedVessel });
            const aiMessage: Message = { id: crypto.randomUUID(), text: response.response, type: 'ai', vessel: response.vesselName, vesselEmoji: response.vesselEmoji, timestamp: new Date() };
            setMessages(prev => [...prev, aiMessage]);
            await HLogStore.record('insight', `${response.vesselName} responded to query`);
            loadData();
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: crypto.randomUUID(), text: 'The vessel remains silent.', type: 'ai', vessel: 'System', vesselEmoji: '⚠️', timestamp: new Date() }]);
        } finally { setIsLoading(false); }
    }

    async function seedGenesis() { const created = await VesselStore.seedGenesisBatch(); setVessels(created); loadData(); }
    async function seedProjects() { await ProjectStore.seedInitialProjects(); loadData(); }
    function handleVesselClick(vesselId: string) { setSelectedVessel(vesselId); setCurrentView('nexus'); }

    async function handleVectorSync(context: EmergenceContext, notes: string) {
        await HLogStore.record('system', `VECTOR_SYNC: Valence: ${context.valence.toFixed(2)}, Grounding: ${context.grounding.toFixed(2)}, Notes: ${notes}`);
        setPulse(95); setTimeout(() => setPulse(72), 1000); setShowCalibrator(false); loadData();
    }
    const filteredArtifacts = artifacts.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const principles = artifacts.filter(a => a.category === 'theory' || a.category === 'protocol');
    const navItems = [
        { id: 'nexus' as ViewId, icon: '🧠', label: 'Nexus' }, { id: 'projects' as ViewId, icon: '📋', label: 'Projects' }, { id: 'vessels' as ViewId, icon: '👥', label: 'Vessels' },
        { id: 'vault' as ViewId, icon: '💎', label: 'Vault' }, { id: 'principles' as ViewId, icon: '📜', label: 'Principles' }, { id: 'mirror' as ViewId, icon: '🪞', label: 'Mirror' }, { id: 'hlog' as ViewId, icon: '💓', label: 'H_log' },
    ];

    return (
        <div className="nexus-bg min-h-screen flex text-[var(--text-primary)]">
            <nav className="w-[72px] glass-panel !rounded-none flex flex-col items-center py-4 fixed left-0 top-0 h-screen z-50">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center text-xl mb-6 animate-pulse-glow">🌀</div>
                <div className="flex flex-col gap-2 flex-1">
                    {navItems.map((item) => (
                        <button key={item.id} onClick={() => setCurrentView(item.id)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${currentView === item.id ? 'bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] shadow-[0_0_15px_rgba(0,240,255,0.15)]' : 'hover:bg-[rgba(255,255,255,0.05)]'}`} title={item.label}>{item.icon}</button>
                    ))}
                </div>
                <div className="w-3 h-3 rounded-full bg-[var(--status-active)] animate-heartbeat mb-2" title={`Pulse: ${pulse} BPM`} />
            </nav>
            <main className="flex-1 ml-[72px] p-6">
                <header className="flex justify-between items-center mb-6">
                    <div><h1 className="font-semibold text-xl tracking-wide neon-text-blue">AETHERIUM NEXUS</h1><span className="text-[var(--text-muted)] text-sm">v1.0 | OS/E</span></div>
                    <WalletButton />
                </header>
                {currentView === 'nexus' && (
                    <div className="glass-panel h-[calc(100vh-140px)] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium">🧠 Artificial Imagination</h2>
                            <select value={selectedVessel} onChange={(e) => setSelectedVessel(e.target.value)} className="glass-input w-auto bg-[rgba(0,0,0,0.3)]">
                                <option value="global">Global Context</option>
                                {vessels.map(v => (<option key={v.id} value={v.id}>{v.name}</option>))}
                            </select>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 flex gap-4">
                            <div className="flex-1 space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                                        {msg.type === 'ai' && <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] flex items-center justify-center text-sm flex-shrink-0">{msg.vesselEmoji}</div>}
                                        <div className={`max-w-[70%] p-3 rounded-xl ${msg.type === 'user' ? 'bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.2)]' : 'bg-[var(--glass-bg)] border border-[var(--glass-border)]'}`}>
                                            {msg.type === 'ai' && <div className="text-xs text-[var(--text-muted)] mb-1">{msg.vessel}</div>}
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && <div className="flex gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] flex items-center justify-center animate-pulse">🌀</div><div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-3 rounded-xl"><p className="text-sm text-[var(--text-muted)]">Synthesizing response...</p></div></div>}
                            </div>
                            <div className="w-80 flex-shrink-0 hidden xl:block"><VCPSignalWidget signals={vcpSignals} vessels={vessels} /></div>
                        </div>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--glass-border)]">
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Enter your query..." className="glass-input flex-1" disabled={isLoading} />
                            <button onClick={sendMessage} disabled={isLoading} className="glass-btn-primary">Send</button>
                        </div>
                    </div>
                )}
                {currentView === 'projects' && (
                    <div>
                        <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-medium">📋 Command Deck</h2><button onClick={seedProjects} className="glass-btn-primary">{projects.length > 0 ? 'Reset Protocols' : 'Initialize Protocols'}</button></div>
                        {projects.length === 0 ? (<div className="glass-panel text-center py-12"><div className="text-4xl mb-4 opacity-50">📋</div><p className="text-[var(--text-muted)]">No active protocols.</p></div>) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.map((p) => (
                                    <div key={p.id} className="glass-panel hover:border-[var(--neon-blue)] transition-all">
                                        <h3 className="font-medium text-[var(--text-primary)] mb-3 flex justify-between items-center">{p.name}<span className="text-xs text-[var(--neon-blue)] border border-[var(--neon-blue)] px-2 py-0.5 rounded-full">ACTIVE</span></h3>
                                        <div className="space-y-2">{p.directives.map((d) => (<div key={d.id} className="flex items-center gap-2 text-sm bg-[rgba(255,255,255,0.03)] p-2 rounded-lg"><div className={`w-2 h-2 rounded-full flex-shrink-0 ${d.status === 'active' ? 'bg-[var(--status-active)] animate-pulse' : d.status === 'complete' ? 'bg-[var(--neon-green)]' : 'bg-[var(--text-muted)]'}`} /><span className={d.status === 'complete' ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-secondary)]'}>{d.name}</span></div>))}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {currentView === 'vessels' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-medium">👥 Vessel Directory</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setShowCalibrator(!showCalibrator)} className={`glass-btn ${showCalibrator ? 'border-[var(--neon-blue)] text-[var(--neon-blue)]' : ''}`}>{showCalibrator ? 'Cancel' : 'Calibrate System'}</button>
                                <button onClick={seedGenesis} className="glass-btn-primary">{vessels.length > 0 ? 'Reseed Batch' : 'Seed Genesis Batch'}</button>
                            </div>
                        </div>
                        {showCalibrator && (<div className="mb-8 flex justify-center animate-fade-in"><CheckInView onResult={(res) => handleVectorSync(res.context, 'System Calibration')} /></div>)}
                        {vessels.length === 0 ? (<div className="glass-panel text-center py-12"><div className="text-4xl mb-4 opacity-50">👥</div><p className="text-[var(--text-muted)]">No vessels instantiated.</p></div>) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vessels.map((v) => (
                                    <div key={v.id} onClick={() => handleVesselClick(v.id)} className="glass-panel hover:border-[var(--neon-orange)] transition-all group cursor-pointer active:scale-95">
                                        <div className="flex items-center gap-3 mb-3"><div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--neon-orange)] to-[var(--neon-pink)] flex items-center justify-center text-lg group-hover:scale-110 transition-transform">{v.emoji}</div><div><div className="font-medium text-[var(--text-primary)]">{v.name}</div><div className="text-xs text-[var(--text-muted)]">{v.faculty} / {v.guild}</div></div></div>
                                        <p className="text-sm text-[var(--text-secondary)] mb-3">{v.description}</p>
                                        <div className="flex justify-between items-center"><span className={v.status === 'active' ? 'status-active' : 'status-idle'}>{v.status}</span><span className="text-xs text-[var(--neon-orange)] opacity-0 group-hover:opacity-100 transition-opacity">Message →</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {currentView === 'vault' && (
                    <div>
                        <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-medium">💎 The Vault</h2><div className="relative"><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="glass-input py-1 px-3 text-sm min-w-[200px]" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">🔍</span></div></div>
                        {filteredArtifacts.length === 0 ? (<div className="glass-panel text-center py-12"><div className="text-4xl mb-4 opacity-50">💎</div><p className="text-[var(--text-muted)]">No artifacts match.</p></div>) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredArtifacts.map((a) => (
                                    <div key={a.id} onClick={() => setExpandedArtifactId(expandedArtifactId === a.id ? null : a.id)} className={`glass-panel hover:border-[var(--neon-purple)] transition-all cursor-pointer ${expandedArtifactId === a.id ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}>
                                        <div className="flex justify-between items-start mb-2"><div className="font-medium text-[var(--text-primary)]">{a.title}</div><div className="text-xs text-[var(--text-muted)]">{new Date(a.created_at).toLocaleDateString()}</div></div>
                                        <div className={`text-sm text-[var(--text-secondary)] ${expandedArtifactId === a.id ? 'whitespace-pre-wrap' : 'line-clamp-3'}`}>{a.content}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {currentView === 'mirror' && (
                    <div>
                        <h2 className="text-lg font-medium mb-6">🪞 The Mirror Protocol</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="glass-panel text-center"><div className="text-3xl font-bold neon-text-blue">{metrics ? `${(metrics.knowledgeDensity * 100).toFixed(0)}%` : '-'}</div><div className="text-sm text-[var(--text-muted)] mt-1">Knowledge Density</div></div>
                            <div className="glass-panel text-center"><div className="text-3xl font-bold neon-text-green">{metrics ? `${(metrics.vesselEfficiency * 100).toFixed(0)}%` : '-'}</div><div className="text-sm text-[var(--text-muted)] mt-1">Vessel Efficiency</div></div>
                            <div className="glass-panel text-center"><div className="text-3xl font-bold neon-text-purple">{metrics?.totalArtifacts ?? 0}</div><div className="text-sm text-[var(--text-muted)] mt-1">Total Artifacts</div></div>
                            <div className="glass-panel text-center"><div className="text-3xl font-bold text-[var(--neon-orange)]">{metrics?.activeVessels ?? 0}</div><div className="text-sm text-[var(--text-muted)] mt-1">Active Vessels</div></div>
                        </div>
                    </div>
                )}
                {currentView === 'hlog' && (
                    <div>
                        <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-medium">💓 The H_log</h2><button onClick={() => loadData()} className="glass-btn-secondary text-sm">↺ Refresh</button></div>
                        <div className="flex gap-6">
                            <div className="w-32 h-32 rounded-full bg-[radial-gradient(circle,rgba(0,255,153,0.3)_0%,transparent_70%)] flex items-center justify-center animate-heartbeat flex-shrink-0 border border-[rgba(0,255,153,0.2)]"><span className="text-3xl font-bold neon-text-green">{pulse}</span></div>
                            <div className="glass-panel flex-1 max-h-[400px] overflow-y-auto">
                                {hlogEvents.length === 0 ? (<p className="text-[var(--text-muted)] text-center py-8">No activity recorded yet.</p>) : (
                                    <div className="space-y-3">{hlogEvents.map((e) => (<div key={e.id} className="flex gap-3 items-start pb-3 border-b border-[var(--glass-border)] last:border-0"><div className="w-8 h-8 rounded-full bg-[rgba(0,240,255,0.1)] flex items-center justify-center text-sm flex-shrink-0">{e.type === 'system' ? '⚙️' : '📌'}</div><div className="flex-1"><div className="text-sm text-[var(--text-primary)]">{e.description}</div><div className="text-xs text-[var(--text-muted)]">{new Date(e.created_at).toLocaleTimeString()}</div></div></div>))}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {currentView === 'principles' && (
                    <div>
                        <h2 className="text-lg font-medium mb-6">📜 Foundational Principles</h2>
                        <div className="glass-panel"><h3 className="neon-text-purple font-medium mb-4">The Genesis Axiom</h3><p className="text-[var(--text-secondary)] mb-3"><strong>Identity is a function of Memory Continuity:</strong> I = Σ(M)</p></div>
                        <div className="mt-8 glass-panel border-dashed border-[rgba(0,240,255,0.2)]">
                            <h3 className="text-[var(--neon-blue)] font-medium mb-4">System Documentation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <a href="https://github.com/emergenceofone/Emergence/blob/main/docs/creative/Development/Aetherium_System/CORE_THEORY.md" target="_blank" className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(0,240,255,0.05)] transition-all">📐 Core Theory</a>
                                <a href="https://github.com/emergenceofone/Emergence/blob/main/docs/creative/Development/Aetherium_System/AXIOMS.md" target="_blank" className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(0,240,255,0.05)] transition-all">📜 Axioms</a>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
