import { Grid, Point } from './grid';
import { findPath } from './pathfinder';

export async function solvePickingTSP(grid: Grid, entrance: Point, targets: Point[]) {
    if (targets.length === 0) return null;
    const allNodes = [entrance, ...targets];
    const memo: Record<string, Point[]> = {};

    for (let i = 0; i < allNodes.length; i++) {
        for (let j = 0; j < allNodes.length; j++) {
            if (i === j) continue;
            const key = `${allNodes[i].x},${allNodes[i].y}-${allNodes[j].x},${allNodes[j].y}`;
            memo[key] = findPath(grid, allNodes[i], allNodes[j]);
        }
    }

    const getPerms = (arr: Point[]): Point[][] => {
        if (arr.length <= 1) return [arr];
        return arr.flatMap((v, i) => getPerms([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [v, ...p]));
    };

    const perms = getPerms(targets);
    let bestDist = Infinity;
    let bestOrder: Point[] = [];

    for (const p of perms) {
        const full = [entrance, ...p];
        let d = 0;
        for (let i = 0; i < full.length - 1; i++) {
            const k = `${full[i].x},${full[i].y}-${full[i+1].x},${full[i+1].y}`;
            d += memo[k].length - 1;
        }
        if (d < bestDist) { bestDist = d; bestOrder = p; }
    }

    const finalPaths: Point[][] = [];
    const finalOrder = [entrance, ...bestOrder];
    for (let i = 0; i < finalOrder.length - 1; i++) {
        finalPaths.push(memo[`${finalOrder[i].x},${finalOrder[i].y}-${finalOrder[i+1].x},${finalOrder[i+1].y}`]);
    }
    return { paths: finalPaths, totalDist: bestDist, order: bestOrder };
}