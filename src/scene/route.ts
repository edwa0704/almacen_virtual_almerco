import * as THREE from "three";
import type { Point } from "../core/pathfinder";

const CELL_SIZE = 1;
const Y_OFFSET = 0.12; // 🔥 más alto para que no choque con el piso

// 🔥 COLORES ULTRA CONTRASTADOS (BIEN VISIBLES)
export const ROUTE_COLORS = [
  0xff0000, // rojo
  0x00ff00, // verde
  0x0000ff, // azul
  0xffff00, // amarillo
  0xff00ff, // magenta
];

// --- RUTAS ---
let routeMeshes: THREE.Mesh[] = [];

// --- PICKER ---
let picker: THREE.Mesh | null = null;
let pickerPath: THREE.Vector3[] = [];
let pickerIndex = 0;

// --- CONVERSIÓN A 3D ---
export function pathToVector3s(path: Point[]): THREE.Vector3[] {
  return path.map(
    (p) =>
      new THREE.Vector3(
        p.x * CELL_SIZE + 0.5,
        Y_OFFSET,
        p.y * CELL_SIZE + 0.5
      )
  );
}

// --- DIBUJAR RUTA (🔥 MEJORADO PRO) ---
export function drawRoute(
  scene: THREE.Scene,
  path: Point[],
  colorIndex = 0
): void {

  // 🔥 SOLUCIÓN: forzar mínimo 2 puntos visibles
  if (path.length < 2) {
    const p = path[0];
    const fakePath = [
      p,
      { x: p.x + 0.01, y: p.y + 0.01 } // pequeño desplazamiento
    ];
    path = fakePath;
  }

  const points = pathToVector3s(path);
  const curve = new THREE.CatmullRomCurve3(points);

  const geo = new THREE.TubeGeometry(
    curve,
    Math.max(path.length * 10, 20), // 🔥 mínimo visible
    0.18, // 🔥 más grueso
    16,
    false
  );

  const color = ROUTE_COLORS[colorIndex % ROUTE_COLORS.length];

  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.8,
  });

  const mesh = new THREE.Mesh(geo, mat);

  // 🔥 separar en altura
  mesh.position.y += colorIndex * 0.07;

  scene.add(mesh);
  routeMeshes.push(mesh);
}
// --- LIMPIAR RUTAS ---
export function clearRoutes(scene: THREE.Scene): void {
  routeMeshes.forEach((m) => {
    m.geometry.dispose();
    (m.material as THREE.Material).dispose();
    scene.remove(m);
  });
  routeMeshes = [];
}

// --- DESTINOS ---
let markers: THREE.Mesh[] = [];

export function drawDestinationMarker(
  scene: THREE.Scene,
  point: Point,
  colorIndex = 0
): void {
  const geo = new THREE.SphereGeometry(0.35, 16, 16);

  const mat = new THREE.MeshStandardMaterial({
    color: ROUTE_COLORS[colorIndex % ROUTE_COLORS.length],
    emissive: ROUTE_COLORS[colorIndex % ROUTE_COLORS.length],
    emissiveIntensity: 0.8,
  });

  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.set(
    point.x * CELL_SIZE + 0.5,
    0.5 + colorIndex * 0.05, // 🔥 también separados
    point.y * CELL_SIZE + 0.5
  );

  scene.add(mesh);
  markers.push(mesh);
}

export function clearMarkers(scene: THREE.Scene): void {
  markers.forEach((m) => {
    m.geometry.dispose();
    (m.material as THREE.Material).dispose();
    scene.remove(m);
  });
  markers = [];
}

// --- PICKER ANIMADO ---
export function startPickerAnimation(
  scene: THREE.Scene,
  fullPath: Point[][]
) {
  pickerPath = fullPath.flat().map(
    (p) =>
      new THREE.Vector3(
        p.x * CELL_SIZE + 0.5,
        0.8,
        p.y * CELL_SIZE + 0.5
      )
  );

  pickerIndex = 0;

  if (!picker) {
    const geo = new THREE.SphereGeometry(0.4, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1, // 🔥 MUY visible
    });

    picker = new THREE.Mesh(geo, mat);
    scene.add(picker);
  }
}

// --- LOOP ---
export function updatePickerAnimation() {
  if (!picker || pickerPath.length === 0) return;

  const target = pickerPath[pickerIndex];

  picker.position.lerp(target, 0.2);

  if (picker.position.distanceTo(target) < 0.05) {
    pickerIndex++;
    if (pickerIndex >= pickerPath.length) {
      pickerIndex = 0;
    }
  }
}