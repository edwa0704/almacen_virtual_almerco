import {
  startPickerAnimation,
  updatePickerAnimation,
  drawRoute,
  drawDestinationMarker,
  clearRoutes,
  clearMarkers
} from "./scene/route";

import { generateWarehouseGrid } from "./core/grid";
import { createScene, renderWarehouse } from "./scene/renderer";

import {
  setupControls,
  showRouteInfo,
  showRouteError
} from "./ui/controls";

import { solveTSP } from "./core/tsp";

import type { WarehouseConfig } from "./core/grid";
import type { Point } from "./core/pathfinder";

// ---------------- CONFIG ----------------
const config: WarehouseConfig = {
  rows: 20,
  cols: 20,
  shelves: [
    { x: 1, y: 1, w: 3, h: 5 },
    { x: 6, y: 1, w: 3, h: 5 },
    { x: 11, y: 1, w: 3, h: 5 },
    { x: 16, y: 1, w: 3, h: 5 },
    { x: 1, y: 9, w: 3, h: 5 },
    { x: 6, y: 9, w: 3, h: 5 },
    { x: 11, y: 9, w: 3, h: 5 },
    { x: 16, y: 9, w: 3, h: 5 },
  ],
  entrance: { x: 0, y: 0 },
};

const grid = generateWarehouseGrid(config);
const entrance: Point = { ...config.entrance };

// ---------------- ESCENA ----------------
const container = document.getElementById("canvas-container")!;
const { scene, camera, renderer } = createScene(container);

renderWarehouse(scene, grid, config);

// ---------------- VALIDACIÓN ----------------
function isWalkable(grid: number[][], p: Point): boolean {
  return (
    p.x >= 0 &&
    p.y >= 0 &&
    p.y < grid.length &&
    p.x < grid[0].length &&
    grid[p.y][p.x] === 0
  );
}

// ---------------- PANEL ----------------
const panel = document.getElementById("panel")!;

setupControls(panel, config.rows, config.cols, (destinations: Point[]) => {

  // 🔥 LIMPIAR ESCENA
  clearRoutes(scene);
  clearMarkers(scene);

  if (destinations.length === 0) return;

  // 🔥 VALIDAR DESTINOS
  const invalidDestinations = destinations.filter(p => !isWalkable(grid, p));
  const validDestinations = destinations.filter(p => isWalkable(grid, p));

  // 🔴 OPCIÓN 1: ALERTA VISUAL
  if (invalidDestinations.length > 0) {
    alert("⚠️ Algunos destinos están dentro de estantes. Se dibujarán en rojo como advertencia.");
  }

  // ❌ si ninguno es válido para ruta
  if (validDestinations.length === 0) {
    // dibujar destinos inválidos solo para visual
    invalidDestinations.forEach((p, index) => {
      drawDestinationMarker(scene, p, index, "red"); // color rojo para inválidos
    });
    showRouteError();
    return;
  }

  // 🔥 TSP solo con destinos válidos
  const result = solveTSP(grid, entrance, validDestinations);

  // ❌ sin solución
  if (!result || result.paths.length === 0) {
    showRouteError();
    return;
  }

  // 🔥 DIBUJAR RUTAS y marcadores
  result.paths.forEach((path, index) => {
    drawRoute(scene, path, index);
    drawDestinationMarker(scene, result.order[index], index); // colores normales
  });

  // 🔥 DIBUJAR destinos inválidos en rojo
  invalidDestinations.forEach((p, index) => {
    drawDestinationMarker(scene, p, validDestinations.length + index, "red");
  });

  // 🔥 INFO
  showRouteInfo(result.totalDist, result.order);

  // 🔥 ANIMACIÓN
  startPickerAnimation(scene, result.paths);

  // DEBUG
  console.log("Orden óptimo:", result.order);
  console.log("Distancia total:", result.totalDist);
  console.log("Destinos inválidos (dibujados en rojo):", invalidDestinations);
});

// ---------------- LOOP ----------------
function animate() {
  requestAnimationFrame(animate);

  updatePickerAnimation();

  renderer.render(scene, camera);
}

animate();