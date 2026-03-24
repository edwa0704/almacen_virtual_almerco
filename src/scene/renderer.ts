import * as THREE from "three";
import type { Grid } from "../core/grid";
import type { WarehouseConfig } from "../core/grid";

const CELL_SIZE = 1;

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  entrance: { x: number; y: number };
}

// --- Crea la escena, cámara y renderer ---
export function createScene(container: HTMLElement): SceneContext & { animate: () => void } {

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // --- Cámara isométrica ---
  const aspect = container.clientWidth / container.clientHeight;
  const d = 15;

  const camera = new THREE.OrthographicCamera(
    -d * aspect,
    d * aspect,
    d,
    -d,
    0.1,
    1000
  );

  camera.position.set(20, 20, 20);
  camera.lookAt(0, 0, 0);

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setSize(container.clientWidth, container.clientHeight);

  // 🔥 MEJORA: sombras suaves
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  // --- LUCES (MEJORADAS) ---

  // Luz ambiental
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  // Luz direccional principal
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(15, 30, 10);

  dirLight.castShadow = true;

  // 🔥 configuración de sombra
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;

  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 100;

  scene.add(dirLight);

  // --- Resize ---
  window.addEventListener("resize", () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    const a = w / h;

    camera.left = -d * a;
    camera.right = d * a;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
  });

  // --- Loop ---
  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  return {
    scene,
    camera,
    renderer,
    entrance: { x: 0, y: 0 },
    animate
  };
}

// --- Renderiza el almacén ---
export function renderWarehouse(
  scene: THREE.Scene,
  grid: Grid,
  config: WarehouseConfig
): void {

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // --- SUELO ---
  const floorGeo = new THREE.PlaneGeometry(
    cols * CELL_SIZE,
    rows * CELL_SIZE
  );

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    roughness: 0.8
  });

  const floor = new THREE.Mesh(floorGeo, floorMat);

  floor.rotation.x = -Math.PI / 2;

  floor.position.set(
    (cols * CELL_SIZE) / 2 - CELL_SIZE / 2,
    0,
    (rows * CELL_SIZE) / 2 - CELL_SIZE / 2
  );

  floor.receiveShadow = true;
  scene.add(floor);

  // --- ESTANTES ---
  const shelfMat = new THREE.MeshStandardMaterial({
    color: 0x8b6914,
    roughness: 0.7,
    metalness: 0.2
  });

  const shelfGeo = new THREE.BoxGeometry(
    CELL_SIZE * 0.9,
    CELL_SIZE * 1.5,
    CELL_SIZE * 0.9
  );

  grid.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {

      if (cell === 1) {
        const mesh = new THREE.Mesh(shelfGeo, shelfMat);

        mesh.position.set(
          colIdx * CELL_SIZE,
          CELL_SIZE * 0.75,
          rowIdx * CELL_SIZE
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);
      }

    });
  });

  // --- ENTRADA (MEJORADA 🔥) ---
  const entranceGeo = new THREE.SphereGeometry(0.4, 24, 24);

  const entranceMat = new THREE.MeshStandardMaterial({
    color: 0x00cc44,
    emissive: 0x00cc44,
    emissiveIntensity: 0.6
  });

  const entranceMesh = new THREE.Mesh(entranceGeo, entranceMat);

  entranceMesh.position.set(
    config.entrance.x * CELL_SIZE,
    0.4,
    config.entrance.y * CELL_SIZE
  );

  scene.add(entranceMesh);

  // --- CENTRAR ESCENA ---
  const centerX = ((cols - 1) * CELL_SIZE) / 2;
  const centerZ = ((rows - 1) * CELL_SIZE) / 2;

  scene.position.set(-centerX, 0, -centerZ);
}