import { Grid, Point } from "./grid";
import { findPath } from "./pathfinder";

export function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((item, i) => {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    return permutations(rest).map((p) => [item, ...p]);
  });
}

export interface TSPResult {
  order: Point[];
  totalDist: number;
  paths: Point[][];
}

export async function solveTSP(
  grid: Grid,
  entrance: Point,
  destinations: Point[]
): Promise<TSPResult> {
  if (destinations.length === 0) {
    return { order: [], totalDist: 0, paths: [] };
  }

  const allNodes = [entrance, ...destinations];
  const memo: Record<string, Point[]> = {};

  // Pre-calculate all necessary paths with memoization
  for (let i = 0; i < allNodes.length; i++) {
    for (let j = 0; j < allNodes.length; j++) {
      const key = `${allNodes[i].x},${allNodes[i].y}-${allNodes[j].x},${allNodes[j].y}`;
      if (i === j) {
        memo[key] = [allNodes[i]];
      } else {
        memo[key] = findPath(grid, allNodes[i], allNodes[j]);
      }
    }
  }

  const perms = permutations(destinations);
  let best: TSPResult = {
    order: perms[0],
    totalDist: Infinity,
    paths: [],
  };

  for (const perm of perms) {
    const stops = [entrance, ...perm];
    let totalDist = 0;
    const paths: Point[][] = [];
    let valid = true;

    for (let i = 0; i < stops.length - 1; i++) {
      const key = `${stops[i].x},${stops[i].y}-${stops[i + 1].x},${stops[i + 1].y}`;
      const path = memo[key];
      if (!path || path.length === 0) {
        valid = false;
        break;
      }
      totalDist += Math.max(0, path.length - 1);
      paths.push(path);
    }

    if (valid && totalDist < best.totalDist) {
      best = { order: perm, totalDist, paths };
    }
  }

  return best;
}
