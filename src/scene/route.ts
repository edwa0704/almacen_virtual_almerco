import * as THREE from 'three';
import { Point } from '../core/grid';

let routeGroup = new THREE.Group();
let picker: THREE.Mesh | null = null;
let animCurve: THREE.CatmullRomCurve3 | null = null;
let progress = 0;

export function drawFullRoute(scene: THREE.Scene, paths: Point[][], productsByStop: any[]) {
    clearRoutes(scene);
    routeGroup = new THREE.Group();
    const colors = [0xff0055, 0x00e5ff, 0xffff00, 0xff00ff, 0x00ff00];
    let allPoints: THREE.Vector3[] = [];

    paths.forEach((path, i) => {
        if (!path || path.length < 2) return;
        const groundPts = path.map(p => new THREE.Vector3(p.x, 0.4, p.y));
        allPoints.push(...groundPts);
        const lastBase = groundPts[groundPts.length - 1].clone();
        const stationProducts = productsByStop[i] || [];
        stationProducts.forEach((prod: any) => {
            const h = (prod.level * 1.5) - 0.2;
            allPoints.push(lastBase.clone().setY(h), lastBase.clone().setY(h), lastBase.clone());
        });
        const curve = new THREE.CatmullRomCurve3(allPoints.slice(-groundPts.length - (stationProducts.length * 3)));
        routeGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.18, 8, false), new THREE.MeshPhongMaterial({ color: colors[i % colors.length], emissive: colors[i % colors.length], emissiveIntensity: 0.8 })));
    });

    if (allPoints.length > 1) {
        animCurve = new THREE.CatmullRomCurve3(allPoints);
        picker = new THREE.Mesh(new THREE.SphereGeometry(0.7), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        scene.add(picker, routeGroup);
    }
    progress = 0;
}

export function animatePicker() {
    if (picker && animCurve) {
        progress += 0.0015; if (progress > 1) progress = 0;
        picker.position.copy(animCurve.getPointAt(progress));
    }
}

export function clearRoutes(scene: THREE.Scene) {
    if (picker) scene.remove(picker);
    scene.remove(routeGroup);
    routeGroup = new THREE.Group();
    animCurve = null;
}