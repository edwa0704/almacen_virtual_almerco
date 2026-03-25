import type { Point } from "../core/pathfinder";

// 🔥 AHORA RECIBE MÚLTIPLES DESTINOS
export type OnFindRoute = (destinations: Point[]) => void;

export function setupControls(
  panel: HTMLElement,
  gridRows: number,
  gridCols: number,
  onFindRoute: OnFindRoute
): void {

  panel.innerHTML = `
    <h2>Picking (Multi-Destino)</h2>

    ${[1,2,3,4,5].map(i => `
      <div class="form-group">
        <label>Destino ${i} - X</label>
        <input id="dest-x-${i}" type="number" min="0" max="${gridCols - 1}" placeholder="0 - ${gridCols - 1}" />
        
        <label>Destino ${i} - Y</label>
        <input id="dest-y-${i}" type="number" min="0" max="${gridRows - 1}" placeholder="0 - ${gridRows - 1}" />
      </div>
    `).join("")}

    <button id="btn-find">🔍 Optimizar Ruta</button>
    <button id="btn-clear" class="secondary">🗑️ Limpiar</button>

    <div id="route-info" class="info-box" style="display:none"></div>

    <h2 style="margin-top:8px">Leyenda</h2>
    <div class="legend">
      <div class="legend-item">
        <div class="dot" style="background:#8b6914"></div>
        <span>Estante</span>
      </div>
      <div class="legend-item">
        <div class="dot" style="background:#e0e0e0"></div>
        <span>Pasillo</span>
      </div>
      <div class="legend-item">
        <div class="dot" style="background:#00cc44;border-radius:50%"></div>
        <span>Entrada</span>
      </div>
      <div class="legend-item">
        <div class="dot" style="background:#00ff88;border-radius:50%"></div>
        <span>Ruta</span>
      </div>
    </div>

    <div class="info-box" style="color:#7ec8e3; margin-top:4px;">
      ✅ Fase 1: Grid generado<br>
      ✅ Fase 2: A* implementado<br>
      ✅ Fase 3: Vista 3D activa<br>
      ✅ Fase 4: Trazado de rutas<br>
      🔥 Fase 5: Optimización TSP
    </div>
  `;

  // 🎨 estilos
  const style = document.createElement("style");
  style.textContent = `
    .form-group { display:flex; flex-direction:column; gap:4px; margin-bottom:8px; }
    .form-group label { font-size:0.75rem; color:#aaa; }
    .form-group input {
      background:#0f3460; border:1px solid #1a4a8a;
      color:#eee; padding:6px 10px; border-radius:6px;
      font-size:0.85rem; outline:none;
    }
    .form-group input:focus { border-color:#e94560; }

    #btn-find {
      background:#e94560; color:white; border:none;
      padding:8px; border-radius:6px; cursor:pointer;
      font-weight:600; font-size:0.9rem; width:100%;
    }
    #btn-find:hover { background:#c73652; }

    #btn-clear {
      background:#0f3460; color:#aaa; border:1px solid #1a4a8a;
      padding:6px; border-radius:6px; cursor:pointer;
      font-size:0.85rem; width:100%;
    }
    #btn-clear:hover { color:#eee; }
  `;
  document.head.appendChild(style);

  // 🔥 EVENTO PRINCIPAL
  document.getElementById("btn-find")!.addEventListener("click", () => {
    const destinations: Point[] = [];

    for (let i = 1; i <= 5; i++) {
      const xInput = document.getElementById(`dest-x-${i}`) as HTMLInputElement;
      const yInput = document.getElementById(`dest-y-${i}`) as HTMLInputElement;

      const x = parseInt(xInput.value);
      const y = parseInt(yInput.value);

      // 🔥 VALIDACIÓN REAL
      if (!isNaN(x) && !isNaN(y)) {
        if (
          x >= 0 && x < gridCols &&
          y >= 0 && y < gridRows
        ) {
          destinations.push({ x, y });
        }
      }
    }

    if (destinations.length === 0) return;

    onFindRoute(destinations);
  });

  // 🔥 LIMPIAR (CORREGIDO)
  document.getElementById("btn-clear")!.addEventListener("click", () => {

    // ✔ limpiar inputs
    for (let i = 1; i <= 5; i++) {
      (document.getElementById(`dest-x-${i}`) as HTMLInputElement).value = "";
      (document.getElementById(`dest-y-${i}`) as HTMLInputElement).value = "";
    }

    // ✔ ocultar info
    const box = document.getElementById("route-info");
    if (box) box.style.display = "none";

    // ✔ limpiar escena
    onFindRoute([]);
  });
}

// 🔥 INFO TSP
export function showRouteInfo(totalDist: number, order: Point[]): void {
  const box = document.getElementById("route-info");
  if (!box) return;

  box.style.display = "block";

  const routeText = order.map(p => `(${p.x},${p.y})`).join(" → ");

  box.innerHTML = `
    <strong>🚀 Ruta Óptima Calculada</strong><br>
    Orden: <strong>Entrada → ${routeText}</strong><br>
    Distancia total: <strong>${totalDist} celdas</strong><br>
    Destinos: <strong>${order.length}</strong>
  `;
}

// 🔥 ERROR
export function showRouteError(): void {
  const box = document.getElementById("route-info");
  if (!box) return;

  box.style.display = "block";
  box.innerHTML = `
    <strong style="color:#e94560">❌ Error</strong><br>
    No se pudo calcular la ruta.
  `;
}