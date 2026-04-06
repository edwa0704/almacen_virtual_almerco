🏭 Almacén Virtual Almerco
Sistema de Enrutamiento y Optimización de Picking

![UI](https://raw.githubusercontent.com/edwa0704/almacen_virtual_almerco/main/assets/ui_v2.png?v=1)

![Tests](https://raw.githubusercontent.com/edwa0704/almacen_virtual_almerco/main/assets/tests_v2.png?v=1)

![Vista 1](https://raw.githubusercontent.com/edwa0704/almacen_virtual_almerco/main/assets/demo1_v2.png?v=1)

🧠 Descripción del Proyecto

Sistema web interactivo que permite seleccionar hasta 5 destinos dentro de un almacén y calcula automáticamente la ruta óptima de picking usando el algoritmo A* y una variante de TSP, con visualización 3D isométrica en Three.js.

En un almacén real, un operario recoge múltiples productos por pedido. Sin optimización, podría recorrer el almacén de forma caótica, cruzando el mismo pasillo varias veces.
Este proyecto construye el motor de navegación del almacén digital:

🔹 Calcula rutas evitando obstáculos con A*
🔹 Optimiza el orden de destinos con TSP
🔹 Visualiza rutas en 3D isométrico con colores por segmento

🚧 Desafío Logístico

En entornos reales de almacén, las rutas de picking pueden ser caóticas, generando hasta un 40% de pérdida en eficiencia operativa.

Este sistema soluciona ese problema mediante algoritmos inteligentes que calculan el camino más corto evitando recorridos innecesarios.

💡 Solución Implementada

Se diseñó un sistema basado en algoritmos de búsqueda y optimización que:

- Reduce recorridos redundantes
- Mejora la eficiencia del operario
- Calcula rutas óptimas en milisegundos

🖥️ Demo

📌 El punto blanco representa al operario moviéndose por la ruta óptima.
📌 Cada segmento tiene un color distinto por destino.

🎛️ Funcionalidades del Panel

- Selección de estación de picking
- Selección de nivel del almacén
- Reset de rutas
- Visualización clara del flujo de recorrido

🧠 Algoritmos

📌 Característica clave:

El algoritmo A* permite la evasión dinámica de obstáculos (estantes del almacén), garantizando rutas viables en todo momento.

```bash
f(n) = g(n) + h(n)
```
g(n) → costo acumulado desde el inicio
h(n) → heurística Manhattan
f(n) → costo total estimado

```bash
h(n) = |n.x - destino.x| + |n.y - destino.y|
```

🔹 TSP (Problema del Agente Viajero)
Hasta 5 destinos → 5! = 120 permutaciones
Se evalúa cada ruta usando A*
Se elige la ruta con menor distancia total

⚡ Optimización aplicada:

- Generación de matriz de distancias entre puntos
- Evaluación de todas las combinaciones posibles
- Selección de la ruta global más eficiente

🗂️ Estructura del Proyecto

```bash

almacen_virtual_almerco/
├── src/
│   ├── main.ts
│   ├── core/
│   │   ├── grid.ts
│   │   ├── pathfinder.ts
│   │   └── tsp.ts
│   ├── scene/
│   │   ├── renderer.ts
│   │   └── route.ts
│   └── ui/
│       └── controls.ts
├── assets/
│   ├── demo.png
│   ├── demo1.png
│   ├── tests.png
│   └── ui.png
├── tests/
│   ├── grid.test.ts
│   └── pathfinder.test.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

⚙️ Requisitos
Node.js ≥ 18
npm o yarn
Navegador moderno (Chrome / Edge / Firefox)

🚀 Instalación COMPLETA (MULTI-TERMINAL)

🔽 1. Clonar repositorio
👉 Funciona igual en TODOS los terminales
```bash
# Clonar repositorio
git clone https://github.com/edwa0704/almacen_virtual_almerco.git
cd almacen_virtual_almerco
```
🔽 2. Instalar dependencias

🪟 Windows (CMD / PowerShell / Git Bash)
```bash
npm install
```
🐧 Linux / 🍎 Mac
```bash
npm install
```
>✔️ (es el mismo comando porque npm es multiplataforma)

🔽 3. Ejecutar el proyecto

🪟 Windows (CMD / PowerShell / Git Bash)
```bash
npm run dev
```
🐧 Linux / 🍎 Mac
```bash
npm run dev
```
✅ Resultado esperado
Se abre automáticamente el navegador
Se muestra el almacén en 3D
Aparece el panel de picking

>👉 El proyecto abrirá automáticamente en el navegador.

▶️ Uso del Sistema
Ingresa coordenadas (X, Y) en el panel
Presiona Optimizar Ruta
Se calcula la mejor ruta automáticamente
Cada tramo se dibuja con un color distinto
Destinos inválidos → 🔴 rojo
Botón Limpiar reinicia

📊 Ejemplo (Actualizado)

Configuración seleccionada en el panel:

- Producto 1 → Estación 1 (Rojo) - Nivel 1  
- Producto 2 → Estación 1 (Rojo) - Nivel 2  
- Producto 3 → Estación 3 (Morado) - Nivel 2  
- Producto 4 → Estación 5 (Verde) - Nivel 1  
- Producto 5 → Estación 5 (Verde) - Nivel 4  

🚀 Resultado generado por el sistema:

Orden óptimo:
Est. 1 (Niv. 1,2) → Est. 3 (Niv. 2) → Est. 5 (Niv. 1,4)

Distancia total: **44 celdas**

📌 Destinos procesados: 5
🚀 Resultados

El sistema es capaz de transformar pedidos complejos en rutas optimizadas en milisegundos, reduciendo significativamente el tiempo de recorrido dentro del almacén.

✔ Optimización automática
✔ Reducción de distancia recorrida
✔ Mejora en productividad logística

📊 Stack Tecnológico

| Capa | Tecnología	| Uso |
|------|------------|-----|
| Lenguaje | TypeScript 5.x | Algoritmos y lógica |
| Renderizado | Three.js | Escena 3D |
| Geometría | TubeGeometry | Rutas |
| Testing | Vitest + Node.js | Pruebas A* |
| UI | HTML + TS | Panel de control |
| Bundler | Vite | Dev server |

✅ Entregables — Proyecto 2

| Fase | Entregable	| Estado |
|------|------------|--------|
| F1 | generateGrid() | ✅ |
| F2 | A* Pathfinding | ✅ |
| F3 | Escena 3D | ✅ |
| F4 | drawRoute() | ✅ |
| F5 | TSP Multi-destino | ✅ |

👨‍💻 Autor

Frank Edwar Pérez Bustillos
📍 SENATI Huánuco
📅 Proyecto Semana 4

