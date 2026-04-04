// Script de validación para visualizar el layout del almacén

import { generateWarehouseGrid, printGrid, type WarehouseConfig } from "./src/core/grid";

const config: WarehouseConfig = {
  rows: 20,
  cols: 20,
  shelves: [
    // 🔻 PASILLO PRINCIPAL (vertical)
    { x: 10, y: 6, w: 2, h: 10 },  // Estante 1 (derecha)
    { x: 4, y: 6, w: 1, h: 10 },   // Estante 2 (izquierda, alto)

    // ➡️ GIRO EN L (SIN ESPACIOS) - Estante 4 conecta con E2 en la esquina
    { x: 4, y: 5, w: 6, h: 1 },    // Estante 4 (horizontal, conectado a E2)

    // ➡️ SEGUNDO PASILLO (horizontal)
    { x: 11, y: 1, w: 2, h: 5 },   // Estante 3 (derecha del segundo pasillo)

    // ⛔ FINAL
    { x: 13, y: 3, w: 2, h: 3 },   // Estante 5 (bloquea el final)
  ],
  entrance: { x: 7, y: 16 },
};

const grid = generateWarehouseGrid(config);
printGrid(grid, config.entrance);

// Validación adicional
console.log("✅ Validación de Layout:");
console.log(`- Estante 1 (derecha): x=[10,11], y=[6,15]`);
console.log(`- Estante 2 (izquierda): x=[4], y=[6,15]`);
console.log(`- Estante 4 (esquina, horizontal): x=[4,9], y=[5]`);
console.log(`- Estante 3 (segundo pasillo): x=[11,12], y=[1,5]`);
console.log(`- Estante 5 (final, bloquea): x=[13,14], y=[3,5]`);
console.log(`\n📍 Camino esperado:`);
console.log(`1. Entrada en (7, 16)`);
console.log(`2. Primer pasillo vertical: (7, 6) → (7, 16)`);
console.log(`3. Giro a derecha en y=5`);
console.log(`4. Segundo pasillo horizontal: (10, 5) → (13, 5)`);
console.log(`5. Estante 5 bloquea el final en x=13`);
