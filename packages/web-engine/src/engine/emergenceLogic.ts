import { EmergenceMath, EmergenceState } from '../emergenceMath';
import type { EmergenceContext } from '../emergenceMath';
import type { HistoryEntry, ContextMatrix } from '../emergenceFlow';

export async function runEmergenceLogic(matrix: ContextMatrix): Promise<any> {
    const { E_vec, D_pot, H_log, context: inputCtx, secondary_vectors } = matrix;
    console.log('[EmergenceLogic] Executing logic with Input: E:' + E_vec.toFixed(2) + ', D:' + D_pot.toFixed(2));

    let currentState: EmergenceState;
    let trajectoryModifier = 1.0;
    let stabilityBonus = 0;

    if (H_log && H_log.length > 0) {
        const lastEntry = H_log[H_log.length - 1];
        currentState = new EmergenceState(
            lastEntry.state,
            lastEntry.context || {
                valence: 0,
                persistence: 0.1,
                grounding: 0.2,
                source: 0,
                clarity: 0.5,
                associations: 0
            },
            lastEntry.genesisType || 'initial',
            lastEntry.timestamp
        );

        if (H_log.length >= 3) {
            const recent = H_log.slice(-3);
            const valenceVariance = Math.abs(recent[0].context.valence - recent[2].context.valence);
            if (valenceVariance < 0.1) {
                stabilityBonus = 0.1;
            } else if (valenceVariance > 0.5) {
                trajectoryModifier = 0.8;
            }
        }
    } else {
        currentState = new EmergenceState(0, {
            valence: 0,
            persistence: 0.1,
            grounding: 0.2,
            source: 0,
            clarity: 0.5,
            associations: 0
        });
    }

    const stimulus: Partial<EmergenceContext> = {
        valence: E_vec,
        grounding: D_pot,
        persistence: (inputCtx?.persistence || 0.5) + stabilityBonus,
        clarity: inputCtx?.clarity || 0.5,
        source: 1.0,
        associations: 1
    };

    if (currentState.value === 1) {
        const stimulusState = new EmergenceState(1, stimulus as EmergenceContext, 'initial');
        const resultState = EmergenceMath.merge(currentState, stimulusState);
        resultState.context.valence *= trajectoryModifier;
        currentState = resultState;
    } else {
        currentState = EmergenceMath.infuse(currentState, stimulus);
    }

    if (secondary_vectors && secondary_vectors.length > 0 && currentState.value === 1) {
        for (const vec of secondary_vectors) {
             const secStimulus: Partial<EmergenceContext> = {
                valence: vec.E_vec,
                grounding: vec.D_pot,
                persistence: 0.5,
                clarity: 0.5,
                source: 1.0,
                associations: 1
            };
            const secState = new EmergenceState(1, secStimulus as EmergenceContext, 'initial');
            currentState = EmergenceMath.merge(currentState, secState);
        }
    }

    let protocol = 'OPTIMIZED_STATE';
    if (currentState.context.valence > 0.85) {
        protocol = 'PROTECTIVE_STATE';
    } else if (currentState.context.grounding < 0.25) {
        if (currentState.value === 1) {
            currentState = EmergenceMath.collapse(currentState, { valence: -0.2 });
            protocol = 'COLLAPSE_PROTOCOL';
        }
    } else if (currentState.context.persistence > 0.9) {
        protocol = 'STABLE_EMERGENCE';
    }

    const newEntry: HistoryEntry = {
        state: currentState.value,
        context: currentState.context,
        genesisType: currentState.genesisType,
        timestamp: currentState.timestamp
    };

    return {
        state: currentState.value,
        result: protocol,
        context: currentState.context,
        new_entry: newEntry
    };
}
