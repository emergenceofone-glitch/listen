/**
 * 🌌 THE EMERGENCE TYPE SYSTEM (OS/E Foundation)
 * Aligned with Aetherium Source Codec v1.0.
 */

/**
 * Core Dimensions of an Emergence Context (MC)
 */
export interface EmergenceContext {
    valence: number;      // -1.0 to +1.0 (How the idea/state feels)
    persistence: number;  // 0.0 to 1.0 (How stable/enduring it is)
    grounding: number;    // 0.0 to 1.0 (External validation/Academic grounding)
    source: number;       // 0.0 (Internal) to 1.0 (External)
    clarity: number;      // 0.0 to 1.0 (Definition of purpose)
    associations: number; // count (Connections to other ideas)
}

/**
 * Foundational States
 * Ψ₀ (Psi-Zero): Conditioned Potential
 * Ψ₁ (Psi-One): Conditioned Presence
 */
export enum EmergenceStateValue {
    POTENTIAL = 0, // Ψ₀
    PRESENCE = 1   // Ψ₁
}

export interface HistoryEntry {
    state: number; // 0 or 1
    context: EmergenceContext;
    genesisType: "infusion" | "collapse" | "merge" | "initial" | "additive";
    timestamp: number;
    label?: string;
    description?: string;
}

/**
 * The Contextual Matrix (MC)
 * Defines the unique condition of any state.
 */
export interface ContextMatrix {
    I_vec: string;           // Input vector (textual description)
    E_vec: number;           // Emotional/Energy vector (-1 to 1)
    H_log: HistoryEntry[];   // Historical log (Memory)
    D_pot: number;           // Depth potential (0 to 1)
    context?: Partial<EmergenceContext>;
    secondary_vectors?: Array<{
        E_vec: number;
        D_pot: number;
    }>;
}

export interface EmergenceResponse {
    state: number;
    result: string;
    context: EmergenceContext;
    new_entry?: HistoryEntry;
}
