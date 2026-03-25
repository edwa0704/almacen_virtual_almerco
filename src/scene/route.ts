import * as THREE from "three";
import type { Point } from "../core/pathfinder";

const CELL_SIZE = 1;
const Y_OFFSET = 0.12;

// 🎨 COLORES
export const ROUTE_COLORS = [
  0xff0000,
  0x00ff00,
  0x0000ff,
  0xffff00,
  0xff00ff,
];

// --- RUTAS ---
let routeMeshes: THREE.Mesh[] = [];

// --- DESTINOS ---
let markers: THREE.Mesh[] = [];

// --- PICKER ---
let picker: THREE.Mesh | null = null;
let pickerPath: THREE.Vector3[] = [];
let pickerIndex = 0;

// 🔥 NUEVO: estado de animación
let isAnimating = false;

// --- CONVERTIR PATH ---
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

// --- DIBUJAR RUTA ---
export function drawRoute(
  scene: THREE.Scene,
  path: Point[],
  colorIndex = 0
): void {

  if (path.length < 2) {
    const p = path[0];
    path = [p, { x: p.x + 0.01, y: p.y + 0.01 }];
  }

  const points = pathToVector3s(path);
  const curve = new THREE.CatmullRomCurve3(points);

  const geo = new THREE.TubeGeometry(
    curve,
    Math.max(path.length * 10, 20),
    0.18,
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
export function drawDestinationMarker(
  scene: THREE.Scene,
  point: Point,
  colorIndex = 0,
  customColor?: number
): void {
  const color =
    customColor ?? ROUTE_COLORS[colorIndex % ROUTE_COLORS.length];

  const geo = new THREE.SphereGeometry(0.35, 16, 16);

  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.8,
  });

  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.set(
    point.x * CELL_SIZE + 0.5,
    0.5 + colorIndex * 0.05,
    point.y * CELL_SIZE + 0.5
  );

  scene.add(mesh);
  markers.push(mesh);
}

// --- LIMPIAR DESTINOS ---
export function clearMarkers(scene: THREE.Scene): void {
  markers.forEach((m) => {
    m.geometry.dispose();
    (m.material as THREE.Material).dispose();
    scene.remove(m);
  });
  markers = [];
}

// --- INICIAR ANIMACIÓN ---
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
  isAnimating = true;

  if (!picker) {
    const geo = new THREE.SphereGeometry(0.4, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1,
    });

    picker = new THREE.Mesh(geo, mat);
    scene.add(picker);
  }
}

// 🔥 NUEVO: DETENER ANIMACIÓN
export function stopPickerAnimation(scene: THREE.Scene) {
  isAnimating = false;
  pickerPath = [];
  pickerIndex = 0;

  if (picker) {
    scene.remove(picker);
    picker.geometry.dispose();
    (picker.material as THREE.Material).dispose();
    picker = null;
  }
}

// --- LOOP ---
export function updatePickerAnimation() {
  if (!picker || pickerPath.length === 0 || !isAnimating) return;

  const target = pickerPath[pickerIndex];

  picker.position.lerp(target, 0.2);

  if (picker.position.distanceTo(target) < 0.05) {
    pickerIndex++;
    if (pickerIndex >= pickerPath.length) {
      pickerIndex = 0;
    }
  }
}