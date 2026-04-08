/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { WarehouseRenderer } from './scene/renderer';
import { RouteVisualizer } from './scene/route';
import { generateGrid, WarehouseConfig, Point } from './core/grid';
import { solveTSP } from './core/tsp';

const WAREHOUSE_CONFIG: WarehouseConfig = {
  rows: 80,
  cols: 80,
  entrance: { x: 53, y: 2 }, // Punto verde centrado en la nueva entrada
  shelves: [
    { id: 1, x: 45, y: 0, w: 1, h: 15, color: 0xcc3333, levels: 4 }, // Pasillo 1 (Entrada): Corto (Largo 15)
    { id: 2, x: 61, y: 0, w: 1, h: 32, color: 0x111111, levels: 4 }, // Pared negra: Recortada (Ya no es innecesaria)
    { id: 3, x: 0, y: 15, w: 45, h: 1, color: 0x6a1b9a, levels: 4 }, // Pasillo 2: Largo (Largo 45)
    { id: 4, x: 0, y: 31, w: 61, h: 1, color: 0xe67e22, levels: 4 }, 
    { id: 5, x: 0, y: 15, w: 1, h: 17, color: 0x1b5e20, levels: 4 }
  ],
};

const PICKING_POINTS: Record<number, Point> = {
  1: { x: 53, y: 5 }, 
  2: { x: 53, y: 12 }, 
  3: { x: 35, y: 23 }, 
  4: { x: 20, y: 23 }, 
  5: { x: 5, y: 23 }
};

const PRODUCTS = [
  { id: '1', name: 'Estación 1 (Rojo)', pos: PICKING_POINTS[1] },
  { id: '2', name: 'Estación 2 (Negro)', pos: PICKING_POINTS[2] },
  { id: '3', name: 'Estación 3 (Morado)', pos: PICKING_POINTS[3] },
  { id: '4', name: 'Estación 4 (Naranja)', pos: PICKING_POINTS[4] },
  { id: '5', name: 'Estación 5 (Verde)', pos: PICKING_POINTS[5] },
];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WarehouseRenderer | null>(null);
  const routeRef = useRef<RouteVisualizer | null>(null);
  
  const [selections, setSelections] = useState<{ id: string, level: string }[]>([
    { id: '', level: '1' },
    { id: '', level: '1' },
    { id: '', level: '1' },
    { id: '', level: '1' },
    { id: '', level: '1' },
  ]);

  const [totalSteps, setTotalSteps] = useState<number | null>(null);
  const [orderStr, setOrderStr] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [zoomValue, setZoomValue] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new WarehouseRenderer(containerRef.current);
    const grid = generateGrid(WAREHOUSE_CONFIG);
    renderer.renderGrid(grid, WAREHOUSE_CONFIG);
    renderer.setEntranceMarker(WAREHOUSE_CONFIG.entrance);
    
    const routeVisualizer = new RouteVisualizer(renderer.scene);
    
    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (rendererRef.current && rendererRef.current.controls) {
        rendererRef.current.controls.update();
        rendererRef.current.renderer.render(rendererRef.current.scene, rendererRef.current.camera);
      }
      if (routeRef.current) {
        routeRef.current.animate();
      }
    };
    
    rendererRef.current = renderer;
    routeRef.current = routeVisualizer;
    
    // Sync zoom slider with controls
    renderer.controls.addEventListener('change', () => {
      setZoomValue(renderer.camera.zoom);
    });
    
    animate();

    // Handle resizing
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (rendererRef.current) {
          rendererRef.current.onWindowResize();
        }
      });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      if (rendererRef.current) {
        rendererRef.current.renderer.dispose();
        if (containerRef.current && rendererRef.current.renderer.domElement) {
          containerRef.current.removeChild(rendererRef.current.renderer.domElement);
        }
      }
    };
  }, []);

  const handleIdChange = (index: number, id: string) => {
    const newSelections = [...selections];
    newSelections[index].id = id;
    setSelections(newSelections);
  };

  const handleLevelChange = (index: number, level: string) => {
    const newSelections = [...selections];
    newSelections[index].level = level;
    setSelections(newSelections);
  };

  const handleCalculate = async () => {
    const filtered = selections.filter(s => s.id !== '');
    if (filtered.length === 0 || !routeRef.current) return;
    
    try {
      setIsCalculating(true);
      
      // Treat each selection as a unique destination
      const destinations = filtered.map(s => PICKING_POINTS[Number(s.id)]);
      const grid = generateGrid(WAREHOUSE_CONFIG);
      
      const result = await solveTSP(grid, WAREHOUSE_CONFIG.entrance, destinations);
      
      // Map visited points back to their original selections (preserving duplicates/levels)
      const visitedLevels: number[] = [];
      const visitedIds: string[] = [];
      const usedSelectionIndices = new Set<number>();

      result.order.forEach((p) => {
        // Find the first selection that matches this point and hasn't been used yet
        const selectionIndex = filtered.findIndex((s, idx) => {
          if (usedSelectionIndices.has(idx)) return false;
          const pt = PICKING_POINTS[Number(s.id)];
          return pt.x === p.x && pt.y === p.y;
        });
        
        if (selectionIndex !== -1) {
          const selection = filtered[selectionIndex];
          usedSelectionIndices.add(selectionIndex);
          visitedLevels.push(Number(selection.level));
          visitedIds.push(selection.id);
        }
      });

      routeRef.current.drawPaths(result.paths, visitedLevels, visitedIds);
      setTotalSteps(result.totalDist);

      const order = visitedIds.map((id, i) => {
        const level = visitedLevels[i];
        return `Est. ${id} (Niv: ${level})`;
      }).join(' → ');
      
      setOrderStr(order);
    } catch (error) {
      console.error("Error en el cálculo de ruta:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClear = () => {
    if (routeRef.current) {
      routeRef.current.clear();
      setTotalSteps(null);
      setOrderStr(null);
      setSelections(selections.map(() => ({ id: '', level: '1' })));
    }
  };

  const handleResetView = () => {
    if (rendererRef.current) {
      rendererRef.current.resetCamera();
      setZoomValue(1);
    }
  };

  const handleZoomChange = (zoom: number) => {
    if (rendererRef.current) {
      rendererRef.current.setZoom(zoom);
      setZoomValue(zoom);
    }
  };

  return (
    <>
      {/* Cabecera Superior */}
      <header>
          <span className="header-title">📊 Almacén Virtual Almerco</span>
          <span className="header-subtitle">Sistema de Enrutamiento y Optimización de Picking</span>
          <span className="badge">PROYECTO COMPLETADO</span>
      </header>

      <div id="main-container">
          {/* Área del Almacén 3D (Izquierda) */}
          <div id="canvas-container" ref={containerRef}>
            {/* Controles Flotantes */}
            <div className="camera-controls">
              <button 
                className="btn-reset-view" 
                onClick={handleResetView} 
                title="Restablecer Vista"
              >
                <RotateCcw size={18} />
                <span className="btn-reset-text">Reset</span>
              </button>
              
              <div className="zoom-slider-container">
                <span className="zoom-label">Zoom</span>
                <input 
                  type="range" 
                  min="0.2" 
                  max="5" 
                  step="0.1" 
                  value={zoomValue} 
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="zoom-slider"
                />
              </div>
            </div>

            {isCalculating && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px] pointer-events-none">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">Calculando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Panel Lateral Derecho */}
          <div id="sidebar">
              <div className="sidebar-header">
                <h2>PICKING (MULTI-DESTINO)</h2>
              </div>
              
              <div className="sidebar-content">
                {/* Botones de Control */}
                <div style={{ borderBottom: '1px solid #37474f', paddingBottom: '15px' }}>
                  <button id="btnOptimizar" className="btn-action" onClick={handleCalculate} style={{ background: '#00c853', color: '#102027' }}>🚀 OPTIMIZAR RUTA</button>
                  <button id="btnLimpiar" className="btn-action" onClick={handleClear} style={{ background: '#ff5252', color: '#fff' }}>🧹 LIMPIAR TODO</button>
                </div>

                <div id="inputs-container">
                  {selections.map((sel, idx) => (
                    <div key={idx} className="input-group">
                      <label>PRODUCTO {idx + 1}</label>
                      <select
                        value={sel.id}
                        onChange={(e) => handleIdChange(idx, e.target.value)}
                        className="w-full bg-[#f0f4f8] border-2 border-[#00c853] text-[#102027] p-2 rounded mb-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#00c853] cursor-pointer"
                      >
                        <option value="" className="bg-white text-black">-- Seleccionar Destino --</option>
                        {PRODUCTS.map(p => (
                          <option key={p.id} value={p.id} className="bg-white text-black">{p.name}</option>
                        ))}
                      </select>
                      <select
                        value={sel.level}
                        onChange={(e) => handleLevelChange(idx, e.target.value)}
                        className="w-full bg-[#f0f4f8] border-2 border-[#00c853] text-[#102027] p-2 rounded text-xs font-bold outline-none focus:ring-2 focus:ring-[#00c853] cursor-pointer"
                      >
                        {[1, 2, 3, 4].map(l => (
                          <option key={l} value={l.toString()} className="bg-white text-black">Nivel de Estante: {l}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Área de Resultados */}
                {totalSteps !== null && (
                  <div id="result-area">
                      <div className="result-panel">
                          <div style={{ color: '#00c853', fontWeight: 'bold', fontSize: '0.9em', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>🚀 Ruta Óptima</div>
                          <div style={{ color: '#fff', fontSize: '0.85em', marginBottom: '12px' }}>
                            <span style={{ color: '#90a4ae', fontWeight: 'bold', fontSize: '0.7em', textTransform: 'uppercase' }}>Orden de Recorrido:</span><br/>
                            <div id="route-order" style={{ marginTop: '5px', lineHeight: '1.4', color: '#e0e0e0' }}>{orderStr}</div>
                          </div>
                          <div style={{ borderTop: '1px solid #37474f', paddingTop: '10px' }}>
                            <div id="route-dist" style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#00c853' }}>
                              Distancia: {totalSteps} celdas
                            </div>
                            <div style={{ fontSize: '0.7em', color: '#90a4ae', marginTop: '4px', textTransform: 'uppercase' }}>Destinos: {selections.filter(s => s.id !== '').length}</div>
                          </div>
                      </div>
                  </div>
                )}

                {/* Sección de Leyenda */}
                <div className="legend">
                    <div className="legend-title">LEYENDA</div>
                    <div className="legend-item"><div className="dot" style={{ background: '#111111', border: '1px solid #444' }}></div> Estante (Obstáculo)</div>
                    <div className="legend-item"><div className="dot" style={{ background: '#999999' }}></div> Pasillo (Transitable)</div>
                    <div className="legend-item"><div className="dot" style={{ background: '#00ff00', borderRadius: '50%' }}></div> Entrada (Inicio)</div>
                    <div className="legend-item"><div className="dot" style={{ background: '#00e5ff' }}></div> Ruta Calculada</div>
                </div>

                {/* Checklist del Proyecto */}
                <div className="checklist">
                    <div className="check-item">✅ Fase 1: Grid generado</div>
                    <div className="check-item">✅ Fase 2: A* implementado</div>
                    <div className="check-item">✅ Fase 3: Vista 3D activa</div>
                    <div className="check-item">✅ Fase 4: Trazado de rutas</div>
                    <div className="check-item current">🔥 Fase 5: Optimización TSP</div>
                </div>

                {/* Marcador de Fin de Panel para confirmar scroll */}
                <div style={{ textAlign: 'center', padding: '40px 0', borderTop: '1px solid #37474f', marginTop: '20px' }}>
                  <div style={{ color: '#00c853', fontSize: '0.7em', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    --- FIN DEL PANEL ---
                  </div>
                  <div style={{ color: '#546e7a', fontSize: '0.6em', marginTop: '5px' }}>
                    Todos los resultados cargados
                  </div>
                </div>
              </div>
          </div>
      </div>
    </>
  );
}
