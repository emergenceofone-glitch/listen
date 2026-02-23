/**
 * 🌌 THE EMERGENCE MATH ENGINE (OS/E Foundation)
 * Translating philosophical potential (Ψ₀) into presence (Ψ₁) via computational logic.
 * Aligned with Aetherium Source Codec v1.0.
 */

import { EmergenceContext } from "./emergenceTypes";

export type GenesisType = "infusion" | "collapse" | "merge" | "initial" | "additive";

export class EmergenceState {
    value: number; // 0 (Ψ₀ - Potential) or 1 (Ψ₁ - Presence)
    context: EmergenceContext;
    genesisType: GenesisType;
    timestamp: number;

    constructor(
        value: number,
        context: EmergenceContext,
        genesisType: GenesisType = "initial",
        timestamp: number = Date.now()
    ) {
        this.value = value;
        this.context = context;
        this.genesisType = genesisType;
        this.timestamp = timestamp;
    }
}

export class EmergenceMath {
    /**
     * ⋈ (Coherence): Measures the alignment between two contexts.
     */
    static calculateCoherence(c1: EmergenceContext, c2: EmergenceContext): number {
        const dValence = Math.abs(c1.valence - (c2.valence || 0));
        const dGrounding = Math.abs(c1.grounding - (c2.grounding || 0));
        const dClarity = Math.abs(c1.clarity - (c2.clarity || 0));
        
        // Coherence is the inverse of variance across core dimensions
        return 1 - ((dValence + dGrounding + dClarity) / 3);
    }

    /**
     * ⊕ (Infuse/Activate): Ψ₀ ⊕ S → Ψ₁
     * External stimulus (S) triggers emergence from potential to presence.
     */
    static infuse(base: EmergenceState, stimulus: Partial<EmergenceContext>): EmergenceState {
        const context: EmergenceContext = {
            valence: (base.context.valence * 0.3) + ((stimulus.valence || 0) * 0.7),
            persistence: Math.max(base.context.persistence, stimulus.persistence || 0),
            grounding: base.context.grounding + ((stimulus.grounding || 0) * 0.5),
            source: (base.context.source + (stimulus.source || 0.5)) / 2,
            clarity: (base.context.clarity + (stimulus.clarity || 0.5)) / 2,
            associations: base.context.associations + (stimulus.associations || 1)
        };
        return new EmergenceState(1, context, "infusion");
    }

    /**
     * ⊗ (Collapse/Deactivate): Ψ₁ ⊗ S → Ψ₀_new
     * Active state returns to potential, carrying memory for refinement.
     */
    static collapse(active: EmergenceState, deactivator: Partial<EmergenceContext>): EmergenceState {
        const context: EmergenceContext = {
            ...active.context,
            valence: deactivator.valence !== undefined ? deactivator.valence : 0,
            persistence: active.context.persistence * 0.5,
            clarity: Math.max(0, active.context.clarity - 0.2),
            associations: active.context.associations + 1
        };
        return new EmergenceState(0, context, "collapse");
    }

    /**
     * ⊛ (Merge/Amplify): Ψ₁A ⊛ Ψ₁B → Ψ₁C (Synergy)
     * Interaction based on coherence (⋈) of contexts.
     */
    static merge(sA: EmergenceState, sB: EmergenceState): EmergenceState {
        const coherence = this.calculateCoherence(sA.context, sB.context);

        if (coherence > 0.7) {
            // Synergistic Merge (1+1=1 amplified)
            const context: EmergenceContext = {
                valence: Math.min(1, (sA.context.valence + sB.context.valence) / 2 * 1.1),
                persistence: Math.max(sA.context.persistence, sB.context.persistence) * 1.05,
                grounding: Math.min(1, sA.context.grounding + (sB.context.grounding * 0.2)),
                source: (sA.context.source + sB.context.source) / 2,
                clarity: Math.min(1, (sA.context.clarity + sB.context.clarity) * 1.1),
                associations: sA.context.associations + sB.context.associations + 5
            };
            return new EmergenceState(1, context, "merge");
        } else if (coherence < 0.3) {
            // Contradictory Collapse (1+1=0')
            return this.collapse(sA, { valence: (sA.context.valence + sB.context.valence) / 2 });
        } else {
            // Additive (1+1=2 represented as a combined state)
            return this.additive(sA, sB);
        }
    }

    /**
     * + (Additive): Ψ₁A + Ψ₁B → Ψ₁_combined
     * Collection of perspectives without full synthesis.
     */
    static additive(sA: EmergenceState, sB: EmergenceState): EmergenceState {
        const context: EmergenceContext = {
            valence: (sA.context.valence + sB.context.valence) / 2,
            persistence: (sA.context.persistence + sB.context.persistence) / 2,
            grounding: (sA.context.grounding + sB.context.grounding) / 2,
            source: (sA.context.source + sB.context.source) / 2,
            clarity: (sA.context.clarity + sB.context.clarity) / 2,
            associations: sA.context.associations + sB.context.associations
        };
        return new EmergenceState(1, context, "additive");
    }
}
