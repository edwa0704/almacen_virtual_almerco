export type Cell = 0 | 1;
export type Grid = Cell[][];
export interface Point { x: number; y: number; }
export interface Shelf extends Point { id: number; w: number; h: number; color: number; levels: number; }
export interface WarehouseConfig { rows: number; cols: number; entrance: Point; shelves: Shelf[]; }

export function generateGrid(cfg: WarehouseConfig): Grid {
    const grid: Grid = Array.from({ length: cfg.rows }, () => Array(cfg.cols).fill(0));
    cfg.shelves.forEach(s => {
        for (let r = s.y; r < s.y + s.h; r++) {
            for (let c = s.x; c < s.x + s.w; c++) {
                if (r >= 0 && r < cfg.rows && c >= 0 && c < cfg.cols) grid[r][c] = 1;
            }
        }
    });
    return grid;
}