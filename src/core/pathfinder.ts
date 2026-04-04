import { Grid, Point } from './grid';
interface Node extends Point { g: number; h: number; f: number; parent: Node | null; }

export function findPath(grid: Grid, start: Point, end: Point): Point[] {
    if (start.x === end.x && start.y === end.y) return [start];
    const open: Node[] = [];
    const closed = new Set<string>();
    const key = (p: Point) => `${p.x},${p.y}`;
    const h = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    open.push({ ...start, g: 0, h: h(start, end), f: h(start, end), parent: null });

    while (open.length > 0) {
        open.sort((a, b) => a.f - b.f);
        const curr = open.shift()!;
        if (curr.x === end.x && curr.y === end.y) {
            const res: Point[] = [];
            let temp: Node | null = curr;
            while (temp) { res.unshift({ x: temp.x, y: temp.y }); temp = temp.parent; }
            return res;
        }
        closed.add(key(curr));
        const nbs = [{x:curr.x,y:curr.y-1},{x:curr.x,y:curr.y+1},{x:curr.x-1,y:curr.y},{x:curr.x+1,y:curr.y}];
        for (const nb of nbs) {
            if (nb.y < 0 || nb.y >= grid.length || nb.x < 0 || nb.x >= grid[0].length) continue;
            if (grid[nb.y][nb.x] === 1 || closed.has(key(nb))) continue;
            const gNew = curr.g + 1;
            const existing = open.find(n => n.x === nb.x && n.y === nb.y);
            if (!existing || gNew < existing.g) {
                const node = { ...nb, g: gNew, h: h(nb, end), f: gNew + h(nb, end), parent: curr };
                if (!existing) open.push(node); else Object.assign(existing, node);
            }
        }
    }
    return [];
}