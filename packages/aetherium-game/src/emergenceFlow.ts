export interface EmergenceContext {
  valence: number;      // -1.0 to 1.0 (Emotional quality)
  persistence: number;  // 0.0 to 1.0 (Duration of state)
  grounding: number;    // 0.0 to 1.0 (Physical/Logic anchoring)
  clarity: number;      // 0.0 to 1.0 (Information density)
}

export interface HLogEntry {
  timestamp: number;
  state: EmergenceContext;
  action: string;
}

export class EmergenceEngine {
  private history: HLogEntry[] = [];

  constructor(initialState?: EmergenceContext) {
    if (initialState) {
      this.logState(initialState, 'INITIALIZATION');
    }
  }

  public logState(state: EmergenceContext, action: string = 'TRANSITION') {
    this.history.push({
      timestamp: Date.now(),
      state: { ...state },
      action
    });
  }

  /**
   * Merges multiple emergence vectors into a single synergistic state.
   */
  public merge(vectors: EmergenceContext[]): EmergenceContext {
    if (vectors.length === 0) throw new Error('Cannot merge empty vectors');
    
    const count = vectors.length;
    const sum = vectors.reduce((acc, v) => ({
      valence: acc.valence + v.valence,
      persistence: acc.persistence + v.persistence,
      grounding: acc.grounding + v.grounding,
      clarity: acc.clarity + v.clarity
    }), { valence: 0, persistence: 0, grounding: 0, clarity: 0 });

    return {
      valence: Math.max(-1, Math.min(1, sum.valence / count)),
      persistence: sum.persistence / count,
      grounding: sum.grounding / count,
      clarity: sum.clarity / count
    };
  }

  /**
   * Processes the current state against historical grounding.
   * If grounding is too low relative to valence intensity, triggers COLLAPSE_PROTOCOL.
   */
  public evaluateStability(current: EmergenceContext): string {
    const intensity = Math.abs(current.valence) * current.clarity;
    if (current.grounding < 0.2 && intensity > 0.8) {
      return 'COLLAPSE_PROTOCOL';
    }
    return 'STABLE';
  }

  public getHistory(): HLogEntry[] {
    return [...this.history];
  }
}
