
import { VCPStore, VesselStore, HLogStore, ArtifactStore, type VCPSignal, type Vessel } from './nexus-store';
import { generateVesselResponse } from '@/ai/flows/vessel-response';

/**
 * Vessel Communion Protocol (VCP)
 * Engine for handling inter-vessel communication and autonomous chain reactions.
 */
export class VesselCommunionProtocol {
    private isProcessing = false;
    private processInterval: NodeJS.Timeout | null = null;
    private readonly POLL_INTERVAL = 3000; // Check for signals every 3s

    constructor() {
        console.log('📡 VCP System Initialized');
    }

    /**
     * Start the VCP processing loop
     */
    public start() {
        if (this.processInterval) return;
        console.log('📡 VCP Link Established - Listening for signals...');
        this.processInterval = setInterval(() => this.processPendingSignals(), this.POLL_INTERVAL);
    }

    /**
     * Stop the processing loop
     */
    public stop() {
        if (this.processInterval) {
            clearInterval(this.processInterval);
            this.processInterval = null;
            console.log('📡 VCP Link Severed');
        }
    }

    /**
     * Process all pending signals in the queue
     */
    private async processPendingSignals() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const pendingSignals = await VCPStore.getPending();
            if (pendingSignals.length === 0) {
                this.isProcessing = false;
                return;
            }

            console.log(`📡 VCP: Processing ${pendingSignals.length} pending signals...`);

            for (const signal of pendingSignals) {
                await this.handleSignal(signal);
                await this.markAsProcessed(signal.id);
            }
        } catch (error) {
            console.error('❌ VCP Error:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Handle a single signal based on its type and target
     */
    private async handleSignal(signal: VCPSignal) {
        console.log(`📨 Processing Signal [${signal.signal_type}] from ${signal.source_vessel_id}`);

        // 1. Log the signal detection
        await HLogStore.record(
            'vcp',
            `Signal Detected: ${signal.signal_type} from ${signal.source_vessel_id}`
        );

        // 2. Dispatch to Target Vessel (if specified) or Broadcast
        if (signal.target_vessel_id) {
            await this.invokeVessel(signal.target_vessel_id, signal);
        } else {
            // Broadcast logic: Find relevant vessels based on signal type
            // For now, prompt the "Global" or "Nexus" to react
            await this.invokeGlobalReaction(signal);
        }

        // 3. Chain Reactions (Hardcoded Logic for Phase 3)
        await this.triggerChainReactions(signal);
    }

    /**
     * Invoke a specific vessel to react to the signal using Genkit
     */
    private async invokeVessel(vesselId: string, signal: VCPSignal) {
        const vessel = await VesselStore.getById(vesselId);
        if (!vessel || vessel.status === 'offline') return;

        console.log(`🤖 Invoking ${vessel.name} for reaction...`);

        // Construct a prompt context from the signal
        const context = `
            SYSTEM ALERT: A VCP Signal has been received.
            TYPE: ${signal.signal_type}
            SOURCE: ${signal.source_vessel_id}
            PAYLOAD: ${JSON.stringify(signal.payload)}
            
            How do you respond?
        `;

        try {
            const response = await generateVesselResponse({
                vesselId: vesselId,
                query: context
            });

            await HLogStore.record(
                'vessel',
                `${vessel.name} reacted to signal: "${response.response.slice(0, 50)}..."`
            );
        } catch (err) {
            console.error(`Failed to invoke vessel ${vessel.name}`, err);
        }
    }

    /**
     * Handle broadcast signals with Global Nexus
     */
    private async invokeGlobalReaction(signal: VCPSignal) {
        // Only react to major signals to avoid noise
        if (signal.signal_type === 'INSIGHT_GENERATED' || signal.signal_type === 'CONFLICT_DETECTED') {
            await this.invokeVessel('global', signal);
        }
    }

    /**
     * Hardcoded Chain Reactions for Phase 3 Demo
     */
    private async triggerChainReactions(signal: VCPSignal) {
        // REACTION 1: INSIGHT -> SCRIBE ARCHIVAL
        if (signal.signal_type === 'INSIGHT_GENERATED') {
            const scribe = await VesselStore.getById('v_scribe'); // Assuming ID convention or search
            // If Scribe exists, ask it to archive
            // For robust implementation, we should look up ID by Name "Scribe"
            const vessels = await VesselStore.getAll();
            const scribeVessel = vessels.find(v => v.name === 'Scribe');

            if (scribeVessel) {
                await this.invokeVessel(scribeVessel.id, {
                    ...signal,
                    target_vessel_id: scribeVessel.id,
                    payload: {
                        ...signal.payload,
                        instruction: "Archive this insight immediately."
                    }
                });
            }
        }
    }

    private async markAsProcessed(signalId: string) {
        await VCPStore.markAsProcessed(signalId);
    }
}
