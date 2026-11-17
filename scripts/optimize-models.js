/**
 * Optimiza los modelos exportados desde Blender.
 *
 *   pnpm optimize:models
 *
 * Lee cada `.glb` de `models/source/` (y sus subcarpetas por sala) y escribe
 * en `public/models/`, con la misma estructura de carpetas, el modelo
 * optimizado y sus niveles de detalle (`.lod1`, `.lod2`), con geometría
 * Draco y texturas WebP. Informa la reducción de peso de cada archivo.
 */
import path from 'node:path';
import {
  MODEL_SIZE_BUDGET,
  findSourceModels,
  optimizeFile,
} from './lib/modelPipeline.js';

const SOURCE_DIR = 'models/source';
const OUTPUT_DIR = 'public/models';

const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
const reduction = (from, to) => `${((1 - to / from) * 100).toFixed(1)}%`;

const models = await findSourceModels(SOURCE_DIR);

if (models.length === 0) {
  console.log(`No hay modelos .glb en ${SOURCE_DIR}/`);
  process.exit(0);
}

let overBudget = false;

for (const { inputPath, relativeDir, name } of models) {
  const { inputSize, outputs } = await optimizeFile(
    inputPath,
    path.join(OUTPUT_DIR, relativeDir),
    name
  );

  console.log(
    `\n${path.join(relativeDir, `${name}.glb`)} (${formatSize(inputSize)})`
  );
  for (const output of outputs) {
    const warning = output.size > MODEL_SIZE_BUDGET ? '  ⚠ supera 5 MB' : '';
    overBudget ||= Boolean(warning);
    console.log(
      `  → ${path.basename(output.path).padEnd(52)} ${formatSize(output.size).padStart(9)}` +
        `  (−${reduction(inputSize, output.size)})${warning}`
    );
  }
}

console.log(`\n${models.length} modelos optimizados en ${OUTPUT_DIR}/`);

// Falla si algún modelo excede el presupuesto de la Definición de Hecho
if (overBudget) process.exit(1);
