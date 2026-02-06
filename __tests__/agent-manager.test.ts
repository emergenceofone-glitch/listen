import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentManager, agentManager } from '../src/lib/agent-manager';
import { ProjectStore, HLogStore } from '../src/lib/nexus-store';

// Helper for waiting for async calls
const flushPromises = () => new Promise(setImmediate);

vi.mock('../src/lib/nexus-store', () => ({
    ProjectStore: {
        getAll: vi.fn(),
    },
    HLogStore: {
        record: vi.fn(),
    },
}));

// We need an actual function reference for dispatch tests
const mockFlow = vi.fn();

describe('AgentManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should implement the Singleton pattern', () => {
        const instance1 = AgentManager.getInstance();
        const instance2 = AgentManager.getInstance();
        expect(instance1).toBe(instance2);
        expect(instance1).toBe(agentManager);
    });

    describe('dispatch', () => {
        it('should log success and return result', async () => {
            mockFlow.mockResolvedValue('success-result');
            const result = await (agentManager as any).dispatch('test-flow', { data: 1 }, mockFlow);

            expect(result).toBe('success-result');
            expect(mockFlow).toHaveBeenCalledWith({ data: 1 });
        });

        it('should log error and record to HLogStore on failure', async () => {
            const error = new Error('flow-failed');
            mockFlow.mockRejectedValue(error);

            await expect((agentManager as any).dispatch('test-flow', { input: 'test' }, mockFlow))
                .rejects.toThrow('flow-failed');

            expect(HLogStore.record).toHaveBeenCalledWith('error', expect.stringContaining('test-flow'), expect.objectContaining({
                error: 'Error: flow-failed',
                inputSummary: ['input']
            }));
        });
    });

    describe('queryProjects', () => {
        it('should return all projects for "list_all"', async () => {
            const mockProjects = [{ id: '1', name: 'Project 1', directives: [] }];
            (ProjectStore.getAll as any).mockResolvedValue(mockProjects);

            const result = await agentManager.queryProjects('list_all');
            expect(result).toEqual(mockProjects);
            expect(ProjectStore.getAll).toHaveBeenCalled();
        });

        it('should filter by ID', async () => {
            const mockProjects = [
                { id: '1', name: 'P1', directives: [] },
                { id: '2', name: 'P2', directives: [] }
            ];
            (ProjectStore.getAll as any).mockResolvedValue(mockProjects);

            const result = await agentManager.queryProjects('by_id', '2');
            expect(result).toEqual(mockProjects[1]);
        });

        it('should filter by tag (fuzzy name match for now)', async () => {
            const mockProjects = [
                { id: '1', name: 'Helios', directives: [] },
                { id: '2', name: 'Aether', directives: [] }
            ];
            (ProjectStore.getAll as any).mockResolvedValue(mockProjects);

            const result = await agentManager.queryProjects('by_tag', 'hel');
            expect(result).toEqual([mockProjects[0]]);
        });

        it('should filter by status', async () => {
            const mockProjects = [
                { id: '1', name: 'P1', directives: [{ status: 'active' }] },
                { id: '2', name: 'P2', directives: [{ status: 'complete' }] }
            ];
            (ProjectStore.getAll as any).mockResolvedValue(mockProjects);

            const result = await agentManager.queryProjects('by_status', 'active');
            expect(result).toEqual([mockProjects[0]]);
        });
    });
});
