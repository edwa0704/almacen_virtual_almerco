import * as THREE from 'three';
import { WarehouseConfig } from '../core/grid';

export class WarehouseRenderer {
    scene = new THREE.Scene();
    camera: THREE.OrthographicCamera;
    renderer = new THREE.WebGLRenderer({ antialias: true });

    constructor() {
        const container = document.getElementById('canvas-container')!;
        this.scene.background = new THREE.Color(0xd0d0d0);
        const aspect = container.clientWidth / container.clientHeight;
        const d = 22; 
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);
        this.camera.position.set(40, 40, 40);
        this.camera.lookAt(15, 0, 15);
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);
        this.scene.add(new THREE.AmbientLight(0xffffff, 1.0), new THREE.DirectionalLight(0xffffff, 0.5));
    }

    init(cfg: WarehouseConfig) {
        const floorSize = 65;
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), new THREE.MeshPhongMaterial({ color: 0x888888 }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(15, -0.05, 15);
        this.scene.add(floor);
        const gh = new THREE.GridHelper(floorSize, floorSize, 0x444444, 0x999999);
        gh.position.set(15, 0, 15);
        this.scene.add(gh);

        cfg.shelves.forEach(s => {
            const levelH = 1.5;
            for (let i = 0; i < s.levels; i++) {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, levelH - 0.1, s.h), new THREE.MeshPhongMaterial({ color: s.color }));
                mesh.position.set(s.x + s.w/2 - 0.5, (levelH * i) + levelH/2, s.y + s.h/2 - 0.5);
                this.scene.add(mesh);
                const sep = new THREE.Mesh(new THREE.BoxGeometry(s.w + 0.3, 0.08, s.h + 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff }));
                sep.position.set(mesh.position.x, levelH * (i + 1), mesh.position.z);
                this.scene.add(sep);
            }
        });
        const ent = new THREE.Mesh(new THREE.SphereGeometry(0.8), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        ent.position.set(cfg.entrance.x, 0.5, cfg.entrance.y);
        this.scene.add(ent);
    }
    render() { this.renderer.render(this.scene, this.camera); }
}