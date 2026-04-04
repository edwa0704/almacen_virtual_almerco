import { WarehouseConfig, generateGrid } from './core/grid';
import { WarehouseRenderer } from './scene/renderer';
import { solvePickingTSP } from './core/tsp';
import { drawFullRoute, clearRoutes, animatePicker } from './scene/route';
import { initUI, updateResults } from './ui/controls';

const config: WarehouseConfig = {
    rows: 60, cols: 60,
    entrance: { x: 30, y: 0 }, 
    shelves: [
        { id: 1, x: 25, y: 0, w: 1, h: 15, color: 0xcc3333, levels: 4 },
        { id: 2, x: 35, y: 0, w: 1, h: 25, color: 0x111111, levels: 4 },
        { id: 3, x: 5, y: 15, w: 20, h: 1, color: 0x6a1b9a, levels: 4 },
        { id: 4, x: 5, y: 25, w: 30, h: 1, color: 0xe67e22, levels: 4 },
        { id: 5, x: 4, y: 15, w: 1, h: 11, color: 0x1b5e20, levels: 4 }
    ]
};

const pickingPoints: Record<number, {x:number, y:number}> = {
    1: { x: 27, y: 8 }, 2: { x: 33, y: 12 }, 3: { x: 15, y: 17 }, 4: { x: 20, y: 23 }, 5: { x: 6, y: 20 }
};

const grid = generateGrid(config);
const app = new WarehouseRenderer();
app.init(config);

initUI(config.shelves, async (selected) => {
    const uniqueIds = Array.from(new Set(selected.map(s => s.id)));
    const targets = uniqueIds.map(id => pickingPoints[id as number]);
    const result = await solvePickingTSP(grid, config.entrance, targets);
    
    if (result && result.paths) {
        const pPerStop = result.order.map(p => {
            const id = Number(Object.keys(pickingPoints).find(k => pickingPoints[+k].x === p.x && pickingPoints[+k].y === p.y));
            return selected.filter(s => s.id === id);
        });
        drawFullRoute(app.scene, result.paths, pPerStop);
        const orderStr = result.order.map((p, i) => {
            const id = Object.keys(pickingPoints).find(k => pickingPoints[+k].x === p.x && pickingPoints[+k].y === p.y);
            const levels = pPerStop[i].map(pr => pr.level).join(',');
            return `Est. ${id} (Niv: ${levels})`;
        }).join(' → ');
        updateResults(orderStr, result.totalDist);
    }
}, () => {
    clearRoutes(app.scene);
    document.getElementById('result-area')!.style.display = 'none';
});

function tick() { requestAnimationFrame(tick); animatePicker(); app.render(); }
tick();