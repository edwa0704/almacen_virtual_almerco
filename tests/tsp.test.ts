import { describe, it, expect } from "vitest";
import { solveTSP } from "../src/core/tsp";

const grid = [
  [0,0,0],
  [0,0,0],
  [0,0,0]
];

describe("solveTSP", () => {

  it("retorna una ruta válida con múltiples destinos", async () => {
    const entrance = { x: 0, y: 0 };
    const destinations = [
      { x: 2, y: 0 },
      { x: 2, y: 2 }
    ];

    const result = await solveTSP(grid, entrance, destinations);

    expect(result.order.length).toBe(2);
    expect(result.totalDist).toBeGreaterThan(0);
    expect(result.paths.length).toBe(2);
  });

  it("retorna solución óptima en grid simple", async () => {
    const entrance = { x: 0, y: 0 };
    const destinations = [
      { x: 1, y: 0 },
      { x: 2, y: 0 }
    ];

    const result = await solveTSP(grid, entrance, destinations);

    // Orden esperado: más cercano primero
    expect(result.order[0]).toEqual({ x: 1, y: 0 });
  });

});