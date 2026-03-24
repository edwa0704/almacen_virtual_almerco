import type { Point } from "./pathfinder";
import type { Grid } from "./grid";
import { findPath } from "./pathfinder";

// 🔥 generar permutaciones
function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];

  return arr.flatMap((item, i) => {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    return permutations(rest).map(p => [item, ...p]);
  });
}

// 🔥 validar que un punto sea caminable
function isWalkable(grid: Grid, p: Point): boolean {
  return grid[p.y] && grid[p.y][p.x] === 0;
}

// 🔥 encontrar celda válida cercana (IMPORTANTE)
function findNearestWalkable(grid: Grid, p: Point): Point | null {
  const directions = [
    { x: 0, y: -1 }, // arriba
    { x: 0, y: 1 },  // abajo
    { x: -1, y: 0 }, // izquierda
    { x: 1, y: 0 }   // derecha
  ];

  for (const d of directions) {
    const nx = p.x + d.x;
    const ny = p.y + d.y;

    if (grid[ny] && grid[ny][nx] === 0) {
      return { x: nx, y: ny };
    }
  }

  return null;
}

// 🔥 TSP PRINCIPAL
export function solveTSP(
  grid: Grid,
  entrance: Point,
  destinations: Point[]
): { order: Point[]; totalDist: number; paths: Point[][] } {

  // 🔥 CORREGIR DESTINOS (evitar estantes)
  const fixedDestinations: Point[] = [];

  for (const dest of destinations) {
    if (isWalkable(grid, dest)) {
      fixedDestinations.push(dest);
    } else {
      const fixed = findNearestWalkable(grid, dest);
      if (fixed) fixedDestinations.push(fixed);
    }
  }

  if (fixedDestinations.length === 0) {
    return { order: [], totalDist: 0, paths: [] };
  }

  const perms = permutations(fixedDestinations);

  let best = {
    order: perms[0],
    totalDist: Infinity,
    paths: [] as Point[][]
  };

  for (const perm of perms) {
    const stops = [entrance, ...perm];

    let totalDist = 0;
    const paths: Point[][] = [];
    let valid = true;

    for (let i = 0; i < stops.length - 1; i++) {
      const path = findPath(grid, stops[i], stops[i + 1]);

      if (path.length === 0) {
        valid = false;
        break;
      }

      totalDist += path.length - 1;
      paths.push(path);
    }

    if (valid && totalDist < best.totalDist) {
      best = {
        order: perm,
        totalDist,
        paths
      };
    }
  }

  return best;
}