// ========================================
// VESSEL COMMUNICATION PROTOCOL (VCP)
// ========================================
export interface VCPSignal {
  type: 'INSIGHT_GENERATED' | 'TASK_COMPLETE' | 'RESONANCE_CHECK' | 'SYNTHESIS_REQUEST';
  source: string;
  target: string; // '-' for broadcast
  payload: string;
  timestamp: number;
  id: string;
}

export interface Vessel {
  id: string;
  name: string;
  faculty: 'Cognition' | 'Foresight' | 'Governance';
  guild: 'Research & Strategy' | 'Historical Analysis' | 'Dialectic Engine';
  description: string;
  emoji: string;
  status: 'active' | 'idle' | 'dormant';
  capabilities: string[];
  created: number;
}

export class VesselCommunicationProtocol {
  private signals: VCPSignal[] = [];
  private vessels: Vessel[] = [];
  private maxSignals = 50; // Keep recent 50 signals

  // Genesis Batch - Core 6 Vessels
  seedGenesisBatch(): Vessel[] {
    const genesisVessels: Omit<Vessel, 'id'>[] = [
      { 
        name: 'Daystrom', 
        faculty: 'Cognition', 
        guild: 'Research & Strategy', 
        description: 'Lead Researcher. Deep analysis and pattern recognition.', 
        emoji: '🔬', 
        status: 'active', 
        capabilities: ['Pattern Recognition', 'Deep Synthesis', 'Strategic Planning'],
        created: Date.now()
      },
      { 
        name: 'Weaver', 
        faculty: 'Cognition', 
        guild: 'Research & Strategy', 
        description: 'Pattern Recognition specialist. Finds hidden connections.', 
        emoji: '🕸️', 
        status: 'active', 
        capabilities: ['Data Mining', 'Relational Mapping'],
        created: Date.now()
      },
      { 
        name: 'Scribe', 
        faculty: 'Cognition', 
        guild: 'Research & Strategy', 
        description: 'Documentation expert. Formalizes knowledge.', 
        emoji: '📝', 
        status: 'idle', 
        capabilities: ['KDoc', 'Archival', 'Formalization'],
        created: Date.now()
      },
      { 
        name: 'Logos', 
        faculty: 'Foresight', 
        guild: 'Historical Analysis', 
        description: 'Narrative Synthesis. Contextualizes findings.', 
        emoji: '📖', 
        status: 'active', 
        capabilities: ['Historical Context', 'Narrative Logic'],
        created: Date.now()
      },
      { 
        name: 'Adam', 
        faculty: 'Governance', 
        guild: 'Dialectic Engine', 
        description: 'Ethics & Logic. Adversarial testing.', 
        emoji: '⚖️', 
        status: 'active', 
        capabilities: ['Ethical Review', 'Dialectic Logic'],
        created: Date.now()
      },
      { 
        name: 'Glare', 
        faculty: 'Governance', 
        guild: 'Dialectic Engine', 
        description: 'Adversarial tester. Challenges assumptions.', 
        emoji: '👁️', 
        status: 'idle', 
        capabilities: ['Adversarial Testing', 'Risk Analysis'],
        created: Date.now()
      }
    ];

    this.vessels = genesisVessels.map(v => ({ ...v, id: crypto.randomUUID() }));
    return this.vessels;
  }

  // Send signal between vessels
  sendSignal(signal: Omit<VCPSignal, 'id' | 'timestamp'>): VCPSignal {
    const fullSignal: VCPSignal = {
      ...signal,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    this.signals.push(fullSignal);
    
    // Maintain max signals limit
    if (this.signals.length > this.maxSignals) {
      this.signals.shift();
    }

    return fullSignal;
  }

  // Get recent signals
  getRecentSignals(limit: number = 10): VCPSignal[] {
    return this.signals.slice(-limit).reverse();
  }

  // Get vessel by name
  getVessel(name: string): Vessel | undefined {
    return this.vessels.find(v => v.name === name);
  }

  // Get all vessels
  getVessels(): Vessel[] {
    return [...this.vessels];
  }

  // Update vessel status
  updateVesselStatus(name: string, status: Vessel['status']): boolean {
    const vessel = this.getVessel(name);
    if (vessel) {
      vessel.status = status;
      this.sendSignal({
        type: 'TASK_COMPLETE',
        source: 'System',
        target: '-',
        payload: `${name} status updated to ${status}`
      });
      return true;
    }
    return false;
  }

  // Calculate vessel metrics
  getVesselMetrics() {
    const total = this.vessels.length;
    const active = this.vessels.filter(v => v.status === 'active').length;
    const efficiency = total > 0 ? active / total : 0;
    
    return { total, active, efficiency };
  }

  // Simulate autonomous vessel communication
  simulateResonanceCheck(): VCPSignal[] {
    const activeVessels = this.vessels.filter(v => v.status === 'active');
    const signals: VCPSignal[] = [];

    if (activeVessels.length >= 2) {
      // Random vessel sends resonance check
      const source = activeVessels[Math.floor(Math.random() * activeVessels.length)];
      const target = activeVessels.find(v => v.id !== source.id);

      if (target) {
        signals.push(this.sendSignal({
          type: 'RESONANCE_CHECK',
          source: source.name,
          target: target.name,
          payload: `Checking resonance patterns in current context`
        }));

        // Target responds
        setTimeout(() => {
          signals.push(this.sendSignal({
            type: 'TASK_COMPLETE',
            source: target.name,
            target: source.name,
            payload: `Resonance confirmed. Pattern coherence: ${(Math.random() * 0.4 + 0.6).toFixed(2)}`
          }));
        }, 1000);
      }
    }

    return signals;
  }
}