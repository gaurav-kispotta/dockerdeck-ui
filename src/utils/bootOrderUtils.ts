import { IDockerService } from '../interface/ast/IDockerService';

/**
 * Computes the boot stage for each service using longest-path in the
 * depends_on DAG.
 *
 * Stage 0  = services with no dependencies (boot first, t = 0)
 * Stage N  = max stage among all direct deps + 1
 *
 * Returns a Map<serviceName, stageIndex> and a stageGroups array where
 * stageGroups[i] is the sorted list of service names at stage i.
 */
export function computeBootStages(services: IDockerService[]): {
    stageMap: Map<string, number>;
    stageGroups: string[][];
} {
    const dependsOnMap = new Map(services.map(s => [s.name, s.dependsOn ?? []]));
    const stageMap = new Map<string, number>();

    function getStage(name: string, visiting = new Set<string>()): number {
        if (stageMap.has(name)) return stageMap.get(name)!;
        if (visiting.has(name)) return 0; // circular dep guard

        visiting.add(name);
        const deps = dependsOnMap.get(name) ?? [];
        const stage = deps.length === 0
            ? 0
            : Math.max(...deps.map((d: string) => getStage(d, new Set(visiting)))) + 1;

        stageMap.set(name, stage);
        return stage;
    }

    for (const s of services) getStage(s.name);

    const maxStage = Math.max(0, ...stageMap.values());
    const stageGroups: string[][] = Array.from({ length: maxStage + 1 }, () => []);

    for (const [name, stage] of stageMap.entries()) {
        stageGroups[stage].push(name);
    }

    // Sort within each stage alphabetically for stable layout
    for (const group of stageGroups) group.sort();

    return { stageMap, stageGroups };
}
