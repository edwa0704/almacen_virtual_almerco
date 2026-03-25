🏭 Almacén Virtual Almerco
Sistema de Enrutamiento y Optimización de Picking

![Demo](https://raw.githubusercontent.com/edwa0704/almacen_virtual_almerco/main/assets/demo.png)

![Vista 1](https://raw.githubusercontent.com/edwa0704/almacen_virtual_almerco/main/assets/demo1.png)

![Tests](https://raw.githubusercontent.com/edwa0704/almacen_virtual_almerco/main/assets/tests.png)

![UI](https://raw.githubusercontent.com/edwa0704/almacen_virtual_almerco/main/assets/ui.png)

🧠 Descripción del Proyecto

Sistema web interactivo que permite seleccionar hasta 5 destinos dentro de un almacén y calcula automáticamente la ruta óptima de picking usando el algoritmo A* y una variante de TSP, con visualización 3D isométrica en Three.js.

En un almacén real, un operario recoge múltiples productos por pedido. Sin optimización, podría recorrer el almacén de forma caótica, cruzando el mismo pasillo varias veces.
Este proyecto construye el motor de navegación del almacén digital:

🔹 Calcula rutas evitando obstáculos con A*
🔹 Optimiza el orden de destinos con TSP
🔹 Visualiza rutas en 3D isométrico con colores por segmento

🖥️ Demo

📌 El punto blanco representa al operario moviéndose por la ruta óptima.
📌 Cada segmento tiene un color distinto por destino.

🧠 Algoritmos

🔹 A* — Función de Evaluación

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

📊 Ejemplo

```bash
Destino 1: (4,1)
Destino 2: (10,3)
Destino 3: (2,6)
Destino 4: (10,7)
Destino 5: (14,3)
```
Resultado:
```bash
Entrada → (4,1) → (2,6) → (10,3) → (10,7) → (14,3)
Distancia total: 35 celdas
```
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

