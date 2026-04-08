import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Grid, WarehouseConfig } from '../core/grid';

export class WarehouseRenderer {
  public scene: THREE.Scene;
  public camera: THREE.OrthographicCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;
  private container: HTMLElement;
  private shelfMeshes: THREE.Mesh[] = [];
  private floor: THREE.Mesh | null = null;
  private entranceMarker: THREE.Mesh | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd0d0d0);

    const aspect = container.clientWidth / container.clientHeight;
    const d = 40;
    this.camera = new THREE.OrthographicCamera(
      -d * aspect, d * aspect,
      d, -d,
      0.1, 1000
    );
    
    // Isometric position
    this.camera.position.set(100, 100, 100);
    this.camera.lookAt(40, 0, 40);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0xd0d0d0);
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(40, 0, 40);
    this.controls.update();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  public onWindowResize() {
    if (!this.container) return;
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const d = 40;
    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  public renderGrid(grid: Grid, cfg: WarehouseConfig, cellSize: number = 1) {
    // Clear previous
    this.shelfMeshes.forEach(m => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
      this.scene.remove(m);
    });
    this.shelfMeshes = [];

    if (this.floor) {
      this.floor.geometry.dispose();
      (this.floor.material as THREE.Material).dispose();
      this.scene.remove(this.floor);
    }

    const rows = grid.length;
    const cols = grid[0].length;
    const floorSize = Math.max(rows, cols) + 5;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.set(40, -0.05, 40);
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    // Grid helper
    const gh = new THREE.GridHelper(floorSize, floorSize, 0x444444, 0x999999);
    gh.position.set(40, 0, 40);
    this.scene.add(gh);

    // Shelves with levels
    cfg.shelves.forEach(s => {
      const levelH = 1.5;
      for (let i = 0; i < s.levels; i++) {
        // Shelf level
        const geo = new THREE.BoxGeometry(s.w, levelH - 0.1, s.h);
        const mat = new THREE.MeshPhongMaterial({ color: s.color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(s.x + s.w/2 - 0.5, (levelH * i) + levelH/2, s.y + s.h/2 - 0.5);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.shelfMeshes.push(mesh);

        // White separator
        const sepGeo = new THREE.BoxGeometry(s.w + 0.3, 0.08, s.h + 0.3);
        const sepMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const sep = new THREE.Mesh(sepGeo, sepMat);
        sep.position.set(mesh.position.x, levelH * (i + 1), mesh.position.z);
        this.scene.add(sep);
      }
    });
  }

  public setEntranceMarker(pos: { x: number, y: number }) {
    if (this.entranceMarker) {
      this.scene.remove(this.entranceMarker);
    }
    const geo = new THREE.SphereGeometry(0.8, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.entranceMarker = new THREE.Mesh(geo, mat);
    this.entranceMarker.position.set(pos.x, 0.5, pos.y);
    this.scene.add(this.entranceMarker);
  }

  public resetCamera() {
    // Reset camera position and zoom
    this.camera.position.set(100, 100, 100);
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
    
    // Reset controls target and state
    this.controls.target.set(40, 0, 40);
    this.controls.reset(); // Reset internal state of OrbitControls
    this.controls.update();
  }

  public setZoom(value: number) {
    this.camera.zoom = value;
    this.camera.updateProjectionMatrix();
  }

  public animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
