import { describe, it, expect } from "vitest";
import { findPath, printGridWithPath, type Point } from "../src/core/pathfinder";
import { generateWarehouseGrid, type Grid } from "../src/core/grid";
 
// ─────────────────────────────────────────────
//  Grids de prueba
// ─────────────────────────────────────────────
 
// Grid 5×5 sin obstáculos (camino libre)
const gridAbierto: Grid = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];
 
// Grid 5×5 con pared vertical que obliga a rodear
//  · · · · ·
//  · █ █ █ ·
//  · █ · █ ·
//  · █ █ █ ·
//  · · · · ·
const gridConObstaculos: Grid = [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 1, 0, 1, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0],
];
 
// Grid 5×5 completamente bloqueado (sin camino posible)
const gridBloqueado: Grid = [
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
];
 
// Grid 10×10 con estantes reales
const grid10x10 = generateWarehouseGrid({
  rows: 10,
  cols: 10,
  shelves: [
    { x: 2, y: 1, w: 1, h: 6 },
    { x: 5, y: 2, w: 1, h: 6 },
  ],
  entrance: { x: 0, y: 0 },
});
 
// ─────────────────────────────────────────────
//  Tests
// ─────────────────────────────────────────────
 
describe("findPath — casos básicos", () => {
 
  it("inicio === destino retorna array con un solo punto", () => {
    const path = findPath(gridAbierto, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(path).toHaveLength(1);
    expect(path[0]).toEqual({ x: 0, y: 0 });
  });
 
  it("camino en línea recta horizontal", () => {
    const path = findPath(gridAbierto, { x: 0, y: 0 }, { x: 4, y: 0 });
    expect(path.length).toBe(5); // 5 celdas: (0,0)→(1,0)→(2,0)→(3,0)→(4,0)
    expect(path[0]).toEqual({ x: 0, y: 0 });
    expect(path[path.length - 1]).toEqual({ x: 4, y: 0 });
  });
 
  it("camino en línea recta vertical", () => {
    const path = findPath(gridAbierto, { x: 0, y: 0 }, { x: 0, y: 4 });
    expect(path.length).toBe(5);
    expect(path[path.length - 1]).toEqual({ x: 0, y: 4 });
  });
 
  it("camino diagonal (L-shape) en grid abierto", () => {
    const path = findPath(gridAbierto, { x: 0, y: 0 }, { x: 4, y: 4 });
    // distancia Manhattan = 8, por lo tanto 9 celdas
    expect(path.length).toBe(9);
    expect(path[0]).toEqual({ x: 0, y: 0 });
    expect(path[path.length - 1]).toEqual({ x: 4, y: 4 });
  });
 
});
 
describe("findPath — obstáculos", () => {
 
  it("rodea una pared completa para llegar al destino", () => {
    // Desde (0,0) hasta (4,4), hay un cuadrado de obstáculos en el centro
    const path = findPath(gridConObstaculos, { x: 0, y: 0 }, { x: 4, y: 4 });
    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toEqual({ x: 4, y: 4 });
    // Ningún paso puede ser un obstáculo
    path.forEach((p) => {
      expect(gridConObstaculos[p.y][p.x]).toBe(0);
    });
  });
 
  it("retorna array vacío si no hay camino posible", () => {
    // Hay una pared vertical que divide el grid: columna 1 es todo 1
    const path = findPath(gridBloqueado, { x: 0, y: 0 }, { x: 4, y: 0 });
    expect(path).toHaveLength(0);
  });
 
  it("retorna array vacío si el inicio es un obstáculo", () => {
    const path = findPath(gridConObstaculos, { x: 1, y: 1 }, { x: 4, y: 4 });
    expect(path).toHaveLength(0);
  });
 
  it("retorna array vacío si el destino es un obstáculo", () => {
    const path = findPath(gridConObstaculos, { x: 0, y: 0 }, { x: 1, y: 1 });
    expect(path).toHaveLength(0);
  });
 
});
 
describe("findPath — grid 10×10 con estantes reales", () => {
 
  it("encuentra ruta desde (0,0) hasta (9,9)", () => {
    const path = findPath(grid10x10, { x: 0, y: 0 }, { x: 9, y: 9 });
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual({ x: 0, y: 0 });
    expect(path[path.length - 1]).toEqual({ x: 9, y: 9 });
  });
 
  it("la ruta no pasa por ningún estante", () => {
    const path = findPath(grid10x10, { x: 0, y: 0 }, { x: 9, y: 9 });
    path.forEach((p) => {
      expect(grid10x10[p.y][p.x]).toBe(0);
    });
  });
 
  it("encuentra ruta corta entre dos puntos cercanos", () => {
    const path = findPath(grid10x10, { x: 0, y: 0 }, { x: 1, y: 0 });
    expect(path.length).toBe(2);
  });
 
  it("imprime visualmente la ruta sin errores", () => {
    const start: Point = { x: 0, y: 0 };
    const end: Point = { x: 9, y: 9 };
    const path = findPath(grid10x10, start, end);
    expect(() => printGridWithPath(grid10x10, path, start, end)).not.toThrow();
  });
 
});
 
describe("findPath — consistencia de la ruta", () => {
 
  it("cada paso es adyacente al anterior (sin saltos)", () => {
    const path = findPath(grid10x10, { x: 0, y: 0 }, { x: 9, y: 9 });
    for (let i = 1; i < path.length; i++) {
      const dx = Math.abs(path[i].x - path[i - 1].x);
      const dy = Math.abs(path[i].y - path[i - 1].y);
      // Cada paso debe mover exactamente 1 celda en una dirección
      expect(dx + dy).toBe(1);
    }
  });
 
  it("la ruta óptima en grid abierto tiene longitud Manhattan+1", () => {
    const start: Point = { x: 0, y: 0 };
    const end: Point = { x: 3, y: 4 };
    const path = findPath(gridAbierto, start, end);
    const manhattan = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
    expect(path.length).toBe(manhattan + 1); // +1 porque incluye el nodo inicial
  });
 
});