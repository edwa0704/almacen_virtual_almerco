export function initUI(shelves: any[], onOptimize: (data: any[]) => void, onClear: () => void) {
    const container = document.getElementById('inputs-container')!;
    container.innerHTML = "";
    const names: any = { 1: 'Rojo', 2: 'Negro', 3: 'Morado', 4: 'Naranja', 5: 'Verde' };
    for (let i = 1; i <= 5; i++) {
        const group = document.createElement('div');
        group.className = 'input-group';
        const opts = shelves.map(s => `<option value="${s.id}">Estación ${s.id} (${names[s.id]})</option>`).join('');
        group.innerHTML = `
            <label style="color:#ff5252; font-weight:bold">PRODUCTO ${i}</label>
            <select id="st-${i}" class="coord-input" style="width:100%; margin-bottom:5px; background:#0d47a1; color:white; padding:5px; border-radius:4px;">
                <option value="">-- Seleccionar --</option>${opts}
            </select>
            <select id="lv-${i}" class="coord-input" style="width:100%; background:#1a237e; color:white; padding:4px; font-size:0.8em; border-radius:4px;">
                <option value="1">Nivel 1</option><option value="2">Nivel 2</option><option value="3">Nivel 3</option><option value="4">Nivel 4</option>
            </select>
        `;
        container.appendChild(group);
    }
    document.getElementById('btnOptimizar')!.onclick = () => {
        const sel = [];
        for (let i = 1; i <= 5; i++) {
            const s = (document.getElementById(`st-${i}`) as HTMLSelectElement).value;
            const l = (document.getElementById(`lv-${i}`) as HTMLSelectElement).value;
            if (s) sel.push({ id: parseInt(s), level: parseInt(l) });
        }
        if (sel.length > 0) onOptimize(sel);
    };
    document.getElementById('btnLimpiar')!.onclick = onClear;
}

export function updateResults(order: string, dist: number) {
    const area = document.getElementById('result-area')!;
    area.style.display = 'block';
    document.getElementById('route-order')!.innerHTML = `<b>Orden:</b><br>${order}`;
    document.getElementById('route-dist')!.innerHTML = `Distancia: <b>${dist} celdas</b>`;
}