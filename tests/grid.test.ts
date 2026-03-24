import { describe, it, expect } from "vitest";
import {
  generateWarehouseGrid,
  printGrid,
  getCellNode,
  type WarehouseConfig,
} from "../src/core/grid";
 
// ─────────────────────────────────────────────
//  Config reutilizables para los tests
// ─────────────────────────────────────────────
 
const config5x5: WarehouseConfig = {
  rows: 5,
  cols: 5,
  shelves: [
    { x: 1, y: 1, w: 1, h: 3 }, // estante vertical izquierdo
    { x: 3, y: 1, w: 1, h: 3 }, // estante vertical derecho
  ],
  entrance: { x: 0, y: 0 },
};
 
const config10x10: WarehouseConfig = {
  rows: 10,
  cols: 10,
  shelves: [
    { x: 1, y: 1, w: 2, h: 4 },
    { x: 5, y: 1, w: 2, h: 4 },
    { x: 1, y: 7, w: 2, h: 2 },
    { x: 5, y: 7, w: 2, h: 2 },
  ],
  entrance: { x: 0, y: 0 },
};
 
const config20x20: WarehouseConfig = {
  rows: 20,
  cols: 20,
  shelves: [
    { x: 1,  y: 1,  w: 3, h: 5 },
    { x: 6,  y: 1,  w: 3, h: 5 },
    { x: 11, y: 1,  w: 3, h: 5 },
    { x: 16, y: 1,  w: 3, h: 5 },
    { x: 1,  y: 9,  w: 3, h: 5 },
    { x: 6,  y: 9,  w: 3, h: 5 },
    { x: 11, y: 9,  w: 3, h: 5 },
    { x: 16, y: 9,  w: 3, h: 5 },
  ],
  entrance: { x: 0, y: 0 },
};
 
// ─────────────────────────────────────────────
//  Tests
// ─────────────────────────────────────────────
 
describe("generateWarehouseGrid", () => {
 
  // --- Dimensiones correctas ---
  it("grid 5×5: tiene las dimensiones correctas", () => {
    const grid = generateWarehouseGrid(config5x5);
    expect(grid.length).toBe(5);       // 5 filas
    grid.forEach((row) => expect(row.length).toBe(5)); // 5 cols
  });
 
  it("grid 10×10: tiene las dimensiones correctas", () => {
    const grid = generateWarehouseGrid(config10x10);
    expect(grid.length).toBe(10);
    grid.forEach((row) => expect(row.length).toBe(10));
  });
 
  it("grid 20×20: tiene las dimensiones correctas", () => {
    const grid = generateWarehouseGrid(config20x20);
    expect(grid.length).toBe(20);
    grid.forEach((row) => expect(row.length).toBe(20));
  });
 
  // --- Estantes marcados como 1 ---
  it("celdas de estantes marcadas como obstáculo (1)", () => {
    const grid = generateWarehouseGrid(config5x5);
    // El estante { x:1, y:1, w:1, h:3 } ocupa (col=1, row=1), (col=1, row=2), (col=1, row=3)
    expect(grid[1][1]).toBe(1);
    expect(grid[2][1]).toBe(1);
    expect(grid[3][1]).toBe(1);
    // El estante { x:3, y:1, w:1, h:3 }
    expect(grid[1][3]).toBe(1);
    expect(grid[2][3]).toBe(1);
    expect(grid[3][3]).toBe(1);
  });
 
  // --- Pasillos marcados como 0 ---
  it("celdas de pasillo marcadas como transitables (0)", () => {
    const grid = generateWarehouseGrid(config5x5);
    expect(grid[0][0]).toBe(0); // entrada
    expect(grid[0][2]).toBe(0); // pasillo central top
    expect(grid[4][4]).toBe(0); // esquina inferior derecha
  });
 
  // --- Entrada siempre walkable ---
  it("la entrada siempre es walkable (0) aunque haya estante encima", () => {
    const cfg: WarehouseConfig = {
      rows: 5,
      cols: 5,
      shelves: [{ x: 0, y: 0, w: 5, h: 5 }], // cubre TODO el grid
      entrance: { x: 0, y: 0 },
    };
    const grid = generateWarehouseGrid(cfg);
    expect(grid[0][0]).toBe(0); // entrada forzada a walkable
  });
 
  // --- Estante fuera de límites no rompe ---
  it("estante parcialmente fuera de límites no lanza error", () => {
    const cfg: WarehouseConfig = {
      rows: 5,
      cols: 5,
      shelves: [{ x: 4, y: 4, w: 5, h: 5 }], // se sale del grid
      entrance: { x: 0, y: 0 },
    };
    expect(() => generateWarehouseGrid(cfg)).not.toThrow();
    const grid = generateWarehouseGrid(cfg);
    expect(grid[4][4]).toBe(1); // la celda válida sí se marca
  });
 
  // --- Entrada fuera de límites lanza error ---
  it("entrada fuera de límites lanza error", () => {
    const cfg: WarehouseConfig = {
      rows: 5,
      cols: 5,
      shelves: [],
      entrance: { x: 10, y: 10 }, // fuera del grid
    };
    expect(() => generateWarehouseGrid(cfg)).toThrow();
  });
});
 
// ─────────────────────────────────────────────
//  Test de getCellNode
// ─────────────────────────────────────────────
 
describe("getCellNode", () => {
  it("retorna walkable=false para celda de estante", () => {
    const grid = generateWarehouseGrid(config5x5);
    const node = getCellNode(grid, 1, 1); // estante
    expect(node.walkable).toBe(false);
    expect(node.x).toBe(1);
    expect(node.y).toBe(1);
  });
 
  it("retorna walkable=true para celda de pasillo", () => {
    const grid = generateWarehouseGrid(config5x5);
    const node = getCellNode(grid, 0, 0); // entrada
    expect(node.walkable).toBe(true);
  });
 
  it("lanza error para coordenadas fuera del grid", () => {
    const grid = generateWarehouseGrid(config5x5);
    expect(() => getCellNode(grid, 99, 99)).toThrow();
  });
});
 
// ─────────────────────────────────────────────
//  Test visual (imprime los 3 grids en consola)
// ─────────────────────────────────────────────
 
describe("printGrid (visual)", () => {
  it("imprime grid 5×5 sin errores", () => {
    const grid = generateWarehouseGrid(config5x5);
    expect(() => printGrid(grid, config5x5.entrance)).not.toThrow();
  });
 
  it("imprime grid 10×10 sin errores", () => {
    const grid = generateWarehouseGrid(config10x10);
    expect(() => printGrid(grid, config10x10.entrance)).not.toThrow();
  });
 
  it("imprime grid 20×20 sin errores", () => {
    const grid = generateWarehouseGrid(config20x20);
    expect(() => printGrid(grid, config20x20.entrance)).not.toThrow();
  });
});