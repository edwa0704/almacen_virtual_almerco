import type { Grid } from "./grid";
 
// --- Tipos ---
export interface Point {
  x: number;
  y: number;
}
 
interface AStarNode {
  x: number;
  y: number;
  g: number;           // costo acumulado desde el inicio
  h: number;           // heurística: estimación al destino
  f: number;           // f = g + h
  parent: AStarNode | null;
}
 
// --- Heurística de Manhattan ---
function heuristic(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
 
// --- Obtener vecinos válidos (4 direcciones: N, S, E, O) ---
function getNeighbors(grid: Grid, node: AStarNode): Point[] {
  const directions: Point[] = [
    { x: 0,  y: -1 }, // Norte
    { x: 0,  y:  1 }, // Sur
    { x: 1,  y:  0 }, // Este
    { x: -1, y:  0 }, // Oeste
  ];
 
  return directions
    .map((d) => ({ x: node.x + d.x, y: node.y + d.y }))
    .filter(
      (p) =>
        p.y >= 0 &&
        p.y < grid.length &&
        p.x >= 0 &&
        p.x < grid[0].length &&
        grid[p.y][p.x] === 0 // solo celdas transitables
    );
}
 
// --- Reconstruye el camino siguiendo los punteros parent ---
function reconstructPath(node: AStarNode): Point[] {
  const path: Point[] = [];
  let current: AStarNode | null = node;
  while (current !== null) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  return path;
}
 
// --- Algoritmo A* principal ---
export function findPath(grid: Grid, start: Point, end: Point): Point[] {
  // Validar que inicio y fin sean transitables
  if (grid[start.y]?.[start.x] !== 0) return [];
  if (grid[end.y]?.[end.x] !== 0) return [];
 
  const open: AStarNode[] = [];
  const closed = new Set<string>();
  const key = (x: number, y: number) => `${x},${y}`;
 
  const startNode: AStarNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, end),
    f: heuristic(start, end),
    parent: null,
  };
 
  open.push(startNode);
 
  while (open.length > 0) {
    // Toma el nodo con menor f (min-heap simplificado con sort)
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
 
    // ¿Llegamos al destino?
    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(current);
    }
 
    closed.add(key(current.x, current.y));
 
    for (const neighbor of getNeighbors(grid, current)) {
      if (closed.has(key(neighbor.x, neighbor.y))) continue;
 
      const gNew = current.g + 1;
      const existing = open.find(
        (n) => n.x === neighbor.x && n.y === neighbor.y
      );
 
      if (!existing || gNew < existing.g) {
        const node: AStarNode = {
          x: neighbor.x,
          y: neighbor.y,
          g: gNew,
          h: heuristic(neighbor, end),
          f: gNew + heuristic(neighbor, end),
          parent: current,
        };
        if (!existing) {
          open.push(node);
        } else {
          Object.assign(existing, node);
        }
      }
    }
  }
 
  return []; // no existe camino
}
 
// --- Utilidad: imprime el grid con la ruta marcada ---
export function printGridWithPath(
  grid: Grid,
  path: Point[],
  start: Point,
  end: Point
): void {
  const pathSet = new Set(path.map((p) => `${p.x},${p.y}`));
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
 
  console.log(`\n🗺️  Ruta encontrada (${path.length} pasos):`);
  console.log("┌" + "─".repeat(cols) + "┐");
 
  for (let r = 0; r < rows; r++) {
    let line = "";
    for (let c = 0; c < cols; c++) {
      const k = `${c},${r}`;
      if (c === start.x && r === start.y)       line += "S"; // Start
      else if (c === end.x && r === end.y)       line += "G"; // Goal
      else if (pathSet.has(k))                   line += "●"; // ruta
      else if (grid[r][c] === 1)                 line += "█"; // estante
      else                                        line += "·"; // pasillo
    }
    console.log("│" + line + "│");
  }
 
  console.log("└" + "─".repeat(cols) + "┘");
  console.log("  S=inicio  G=destino  ●=ruta  █=estante  ·=pasillo\n");
}