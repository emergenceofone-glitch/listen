import { EmergenceEngine, EmergenceContext } from '../src/emergenceFlow';

describe('EmergenceEngine', () => {
  let engine: EmergenceEngine;

  beforeEach(() => {
    engine = new EmergenceEngine();
  });

  test('should merge multiple vectors correctly', () => {
    const v1: EmergenceContext = { valence: 0.5, persistence: 0.8, grounding: 0.4, clarity: 0.6 };
    const v2: EmergenceContext = { valence: -0.1, persistence: 0.4, grounding: 0.6, clarity: 0.2 };
    
    const merged = engine.merge([v1, v2]);
    
    expect(merged.valence).toBeCloseTo(0.2);
    expect(merged.persistence).toBeCloseTo(0.6);
    expect(merged.grounding).toBeCloseTo(0.5);
    expect(merged.clarity).toBeCloseTo(0.4);
  });

  test('should trigger COLLAPSE_PROTOCOL when grounding is low and intensity is high', () => {
    const unstableState: EmergenceContext = { 
      valence: 0.9, 
      persistence: 0.5, 
      grounding: 0.1, 
      clarity: 0.95 
    };
    
    const status = engine.evaluateStability(unstableState);
    expect(status).toBe('COLLAPSE_PROTOCOL');
  });

  test('should remain STABLE when grounding is sufficient', () => {
    const stableState: EmergenceContext = { 
      valence: 0.9, 
      persistence: 0.5, 
      grounding: 0.8, 
      clarity: 0.95 
    };
    
    const status = engine.evaluateStability(stableState);
    expect(status).toBe('STABLE');
  });

  test('should maintain history of logged states', () => {
    const state: EmergenceContext = { valence: 0, persistence: 0, grounding: 0, clarity: 0 };
    engine.logState(state, 'TEST_ACTION');
    
    const history = engine.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].action).toBe('TEST_ACTION');
  });
});
