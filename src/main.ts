import {
  startPickerAnimation,
  updatePickerAnimation,
  drawRoute,
  drawDestinationMarker,
  clearRoutes,
  clearMarkers,
  stopPickerAnimation
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

// 🔥 eliminar duplicados
function removeDuplicates(points: Point[]): Point[] {
  const seen = new Set<string>();
  return points.filter(p => {
    const key = `${p.x}-${p.y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---------------- PANEL ----------------
const panel = document.getElementById("panel")!;

setupControls(panel, config.rows, config.cols, (destinations: Point[]) => {

  // 🔥 LIMPIEZA TOTAL SIEMPRE
  clearRoutes(scene);
  clearMarkers(scene);
  stopPickerAnimation(scene);

  // 🔥 SI LIMPIAR
  if (destinations.length === 0) {
    const box = document.getElementById("route-info");
    if (box) box.style.display = "none";
    return;
  }

  // 🔥 eliminar duplicados
  const uniqueDestinations = removeDuplicates(destinations);

  // 🔥 separar válidos e inválidos
  const invalidDestinations = uniqueDestinations.filter(p => !isWalkable(grid, p));
  const validDestinations = uniqueDestinations.filter(p => isWalkable(grid, p));

  // ⚠️ aviso
  if (invalidDestinations.length > 0) {
    alert("⚠️ Algunos destinos están dentro de estantes. Se dibujarán en rojo.");
  }

  // ❌ TODOS inválidos (SOLUCIÓN CLAVE)
  if (validDestinations.length === 0) {

    // dibujar solo en rojo
    invalidDestinations.forEach((p, index) => {
      drawDestinationMarker(scene, p, index, 0xff0000);
    });

    // 🔥 mensaje PRO (NO error feo)
    const box = document.getElementById("route-info");
    if (box) {
      box.style.display = "block";
      box.innerHTML = `
        <strong style="color:#e94560">⚠️ Destinos inválidos</strong><br>
        Todos los puntos están dentro de estantes.<br>
        Intenta coordenadas en pasillos.
      `;
    }

    return;
  }

  // 🔥 TSP
  const result = solveTSP(grid, entrance, validDestinations);

  // ❌ sin solución
  if (!result || result.paths.length === 0) {
    showRouteError();
    return;
  }

  // 🔥 DIBUJAR RUTAS + DESTINOS CORRECTOS
  result.paths.forEach((path, index) => {
    drawRoute(scene, path, index);
    drawDestinationMarker(scene, result.order[index], index);
  });

  // 🔴 DIBUJAR INVALIDOS
  invalidDestinations.forEach((p, index) => {
    drawDestinationMarker(
      scene,
      p,
      validDestinations.length + index,
      0xff0000
    );
  });

  // 🔥 INFO
  showRouteInfo(result.totalDist, result.order);

  // 🔥 ANIMACIÓN
  startPickerAnimation(scene, result.paths);

  // DEBUG
  console.log("Orden óptimo:", result.order);
  console.log("Distancia total:", result.totalDist);
  console.log("Válidos:", validDestinations);
  console.log("Inválidos:", invalidDestinations);
});

// ---------------- LOOP ----------------
function animate() {
  requestAnimationFrame(animate);

  updatePickerAnimation();

  renderer.render(scene, camera);
}

animate();