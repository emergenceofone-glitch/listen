// ========================================
// H.E.N.S. PROTOCOL (90-Second Rule)
// ========================================
export interface SomaticState {
  valence: number; // 0-1 scale
  grounding: number; // 0-1 scale  
  persistence: number; // 0-1 scale
  timestamp: number;
}

export class HENSProtocol {
  private static readonly EMOTION_LIFESPAN = 90000; // 90 seconds in ms
  private emotionStartTime: number | null = null;
  private currentState: SomaticState = {
    valence: 0.5,
    grounding: 0.5,
    persistence: 0.5,
    timestamp: Date.now()
  };

  // Track emotional state and apply 90-second rule
  updateSomaticState(valence: number, grounding: number = 0.5, persistence: number = 0.5) {
    const now = Date.now();
    
    // If this is a new emotional state, reset timer
    if (!this.emotionStartTime || Math.abs(valence - this.currentState.valence) > 0.2) {
      this.emotionStartTime = now;
    }
    
    // Apply 90-second rule - after 90s, emotion should naturally decay
    const emotionAge = now - (this.emotionStartTime || now);
    const decayFactor = emotionAge > HENSProtocol.EMOTION_LIFESPAN ? 
      Math.max(0.1, 1 - ((emotionAge - HENSProtocol.EMOTION_LIFESPAN) / HENSProtocol.EMOTION_LIFESPAN)) : 1;
    
    this.currentState = {
      valence: this.normalizeValue(valence * decayFactor),
      grounding: this.normalizeValue(grounding),
      persistence: this.normalizeValue(persistence),
      timestamp: now
    };
    
    return this.currentState;
  }

  getCurrentState(): SomaticState {
    return { ...this.currentState };
  }

  // Check if current emotion has exceeded natural lifespan
  isEmotionPersisting(): boolean {
    if (!this.emotionStartTime) return false;
    return (Date.now() - this.emotionStartTime) > HENSProtocol.EMOTION_LIFESPAN;
  }

  // Get compass visual state for UI
  getCompassState() {
    const { valence } = this.currentState;
    const isHigh = Math.abs(valence - 0.5) > 0.3;
    
    return {
      className: valence > 0.7 ? 'compass-valence-positive' : 
                 valence < 0.3 ? 'compass-valence-negative' : '',
      intensity: isHigh ? 'compass-valence-high' : '',
      pulseRate: isHigh ? '0.8s' : '2s'
    };
  }

  private normalizeValue(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}