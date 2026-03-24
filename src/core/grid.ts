export type Cell = 0 | 1; // 0 = pasillo, 1 = obstáculo/estante
export type Grid = Cell[][];
 
export interface GridNode {
  x: number;
  y: number;
  walkable: boolean;
}
 
export interface WarehouseConfig {
  rows: number;
  cols: number;
  shelves: { x: number; y: number; w: number; h: number }[];
  entrance: { x: number; y: number };
}
 
// --- Generación del grid ---
export function generateWarehouseGrid(cfg: WarehouseConfig): Grid {
  // 1. Inicializa toda la matriz como pasillo (0)
  const grid: Grid = Array.from(
    { length: cfg.rows },
    () => Array(cfg.cols).fill(0) as Cell[]
  );
 
  // 2. Marca cada estante como obstáculo (1)
  cfg.shelves.forEach((s) => {
    for (let r = s.y; r < s.y + s.h; r++) {
      for (let c = s.x; c < s.x + s.w; c++) {
        // Verifica que la celda esté dentro de los límites
        if (r >= 0 && r < cfg.rows && c >= 0 && c < cfg.cols) {
          grid[r][c] = 1;
        }
      }
    }
  });
 
  // 3. Garantiza que la entrada siempre sea walkable
  const { x, y } = cfg.entrance;
  if (y >= 0 && y < cfg.rows && x >= 0 && x < cfg.cols) {
    grid[y][x] = 0;
  } else {
    throw new Error(
      `Entrada fuera de límites: (${x}, ${y}) en grid ${cfg.cols}×${cfg.rows}`
    );
  }
 
  return grid;
}
 
// --- Visualización ASCII en consola ---
export function printGrid(grid: Grid, entrance?: { x: number; y: number }): void {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
 
  console.log(`\n📦 Grid ${cols}×${rows}:`);
  console.log("┌" + "─".repeat(cols) + "┐");
 
  grid.forEach((row, rowIdx) => {
    const line = row
      .map((cell, colIdx) => {
        // Marca la entrada con "E"
        if (entrance && rowIdx === entrance.y && colIdx === entrance.x) {
          return "E";
        }
        return cell === 1 ? "█" : "·";
      })
      .join("");
    console.log("│" + line + "│");
  });
 
  console.log("└" + "─".repeat(cols) + "┘");
  console.log("  █ = estante  · = pasillo  E = entrada\n");
}
 
// --- Utilidad: convierte GridNode desde una celda ---
export function getCellNode(grid: Grid, x: number, y: number): GridNode {
  if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
    throw new Error(`Celda fuera de límites: (${x}, ${y})`);
  }
  return { x, y, walkable: grid[y][x] === 0 };
}