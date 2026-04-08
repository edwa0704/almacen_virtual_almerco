import * as THREE from 'three';
import { Point } from '../core/grid';

export class RouteVisualizer {
    private scene: THREE.Scene;
    private routeGroup: THREE.Group = new THREE.Group();
    private picker: THREE.Mesh | null = null;
    private animCurve: THREE.CatmullRomCurve3 | null = null;
    private progress: number = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public drawPaths(paths: Point[][], levels: number[], stationIds: string[]) {
        this.clear();
        this.routeGroup = new THREE.Group();
        const colors = [0xff0055, 0x00e5ff, 0xffff00, 0xff00ff, 0x00ff00];
        let allPoints: THREE.Vector3[] = [];

        const shelfOffsets: Record<string, { dx: number, dy: number }> = {
            '1': { dx: -8, dy: 0 },
            '2': { dx: 8, dy: 0 },
            '3': { dx: 0, dy: -8 },
            '4': { dx: 0, dy: 8 },
            '5': { dx: -5, dy: 0 },
        };

        paths.forEach((path, i) => {
            if (!path || path.length === 0) return;
            
            const groundPts = path.map(p => new THREE.Vector3(p.x, 0.4, p.y));
            allPoints.push(...groundPts);
            
            // Solo dibuja el tubo del suelo si hay movimiento horizontal
            if (groundPts.length >= 2) {
                const curve = new THREE.CatmullRomCurve3(groundPts);
                const tube = new THREE.Mesh(
                    new THREE.TubeGeometry(curve, 64, 0.15, 8, false),
                    new THREE.MeshPhongMaterial({ 
                        color: colors[i % colors.length], 
                        emissive: colors[i % colors.length], 
                        emissiveIntensity: 0.5 
                    })
                );
                this.routeGroup.add(tube);
            }

            // Dibuja la subida vertical SIEMPRE, incluso si no hubo movimiento horizontal
            if (i < levels.length && i < stationIds.length) {
                const lastPt = groundPts[groundPts.length - 1];
                const targetLevel = levels[i];
                const stationId = stationIds[i];
                const height = targetLevel * 1.5 - 0.75;
                const offset = shelfOffsets[stationId] || { dx: 0, dy: 0 };

                const hookPts = [
                    lastPt.clone(),
                    new THREE.Vector3(lastPt.x, height, lastPt.z),
                    new THREE.Vector3(lastPt.x + offset.dx, height, lastPt.z + offset.dy)
                ];
                
                allPoints.push(hookPts[1], hookPts[2], hookPts[1]);

                const hookCurve = new THREE.CatmullRomCurve3(hookPts);
                const hookTube = new THREE.Mesh(
                    new THREE.TubeGeometry(hookCurve, 20, 0.15, 8, false),
                    new THREE.MeshPhongMaterial({ 
                        color: colors[i % colors.length],
                        emissive: colors[i % colors.length],
                        emissiveIntensity: 0.3
                    })
                );
                this.routeGroup.add(hookTube);
            }
        });

        if (allPoints.length > 1) {
            this.animCurve = new THREE.CatmullRomCurve3(allPoints);
            this.picker = new THREE.Mesh(
                new THREE.SphereGeometry(0.6, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            this.scene.add(this.picker, this.routeGroup);
        }
        this.progress = 0;
    }

    public animate() {
        if (this.picker && this.animCurve) {
            this.progress += 0.002;
            if (this.progress > 1) this.progress = 0;
            this.picker.position.copy(this.animCurve.getPointAt(this.progress));
        }
    }

    public clear() {
        if (this.picker) this.scene.remove(this.picker);
        this.scene.remove(this.routeGroup);
        this.routeGroup = new THREE.Group();
        this.animCurve = null;
    }
}