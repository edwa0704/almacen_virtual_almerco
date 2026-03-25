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
  return (
    p.x >= 0 &&
    p.y >= 0 &&
    p.y < grid.length &&
    p.x < grid[0].length &&
    grid[p.y][p.x] === 0
  );
}

// 🔥 NUEVO: buscar celda válida en radio (MUCHO MÁS ROBUSTO)
function findNearestWalkable(grid: Grid, p: Point): Point | null {
  const maxRadius = 10;

  for (let r = 1; r <= maxRadius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {

        const nx = p.x + dx;
        const ny = p.y + dy;

        if (
          ny >= 0 &&
          ny < grid.length &&
          nx >= 0 &&
          nx < grid[0].length &&
          grid[ny][nx] === 0
        ) {
          return { x: nx, y: ny };
        }

      }
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

  // 🔥 CORREGIR DESTINOS
  const fixedDestinations: Point[] = [];

  for (const dest of destinations) {

    // ✔ si es válido
    if (isWalkable(grid, dest)) {
      fixedDestinations.push(dest);
      continue;
    }

    // 🔥 intentar corregir
    const fixed = findNearestWalkable(grid, dest);

    if (fixed) {
      fixedDestinations.push(fixed);
    } else {
      console.warn("Destino sin solución:", dest);
    }
  }

  // ❌ si no hay destinos válidos
  if (fixedDestinations.length === 0) {
    return { order: [], totalDist: 0, paths: [] };
  }

  // 🔥 eliminar duplicados después de corregir
  const unique = new Map<string, Point>();
  fixedDestinations.forEach(p => {
    unique.set(`${p.x}-${p.y}`, p);
  });

  const finalDestinations = Array.from(unique.values());

  const perms = permutations(finalDestinations);

  let best = {
    order: perms[0],
    totalDist: Infinity,
    paths: [] as Point[][]
  };

  // 🔥 evaluar todas las rutas
  for (const perm of perms) {

    const stops = [entrance, ...perm];

    let totalDist = 0;
    const paths: Point[][] = [];
    let valid = true;

    for (let i = 0; i < stops.length - 1; i++) {

      const path = findPath(grid, stops[i], stops[i + 1]);

      // ❌ si no hay camino
      if (path.length === 0) {
        valid = false;
        break;
      }

      totalDist += path.length - 1;
      paths.push(path);
    }

    // 🔥 elegir mejor solución
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