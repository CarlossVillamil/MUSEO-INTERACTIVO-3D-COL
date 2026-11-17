import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { Logger, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  cloneDocument,
  dedup,
  draco,
  metalRough,
  prune,
  simplify,
  textureCompress,
  weld,
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

/**
 * Niveles de detalle generados por cada modelo. `ratio` es la fracción de
 * vértices que se conserva; el LOD0 no se simplifica.
 */
export const LOD_LEVELS = [
  { suffix: '', ratio: 1 },
  { suffix: '.lod1', ratio: 0.5 },
  { suffix: '.lod2', ratio: 0.2 },
];

// Error máximo de simplificación (fracción del tamaño del modelo)
const SIMPLIFY_ERROR = 0.01;
// Lado máximo de las texturas en píxeles
const MAX_TEXTURE_SIZE = 2048;
const WEBP_QUALITY = 85;

/** Presupuesto de la Definición de Hecho: < 5 MB por modelo. */
export const MODEL_SIZE_BUDGET = 5 * 1024 * 1024;

// Solo advertencias y errores: el detalle de cada transformación es ruido
const logger = new Logger(Logger.Verbosity.WARN);

let ioPromise = null;

/** NodeIO con todas las extensiones y los codificadores Draco registrados. */
export function createIO() {
  ioPromise ??= Promise.all([
    draco3d.createEncoderModule(),
    draco3d.createDecoderModule(),
    MeshoptSimplifier.ready,
  ]).then(([encoder, decoder]) =>
    new NodeIO()
      .setLogger(logger)
      .registerExtensions(ALL_EXTENSIONS)
      .registerDependencies({
        'draco3d.encoder': encoder,
        'draco3d.decoder': decoder,
      })
  );
  return ioPromise;
}

/**
 * Busca los `.glb` de `sourceDir` y sus subcarpetas (una por sala).
 * `relativeDir` es la subcarpeta respecto a `sourceDir` ('' en la raíz).
 */
export async function findSourceModels(sourceDir, relativeDir = '') {
  const entries = await readdir(path.join(sourceDir, relativeDir), {
    withFileTypes: true,
  });
  const models = [];
  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      models.push(...(await findSourceModels(sourceDir, relativePath)));
    } else if (entry.name.toLowerCase().endsWith('.glb')) {
      models.push({
        inputPath: path.join(sourceDir, relativePath),
        relativeDir,
        name: path.basename(entry.name, path.extname(entry.name)),
      });
    }
  }
  return models;
}

/**
 * Aplica el pipeline a un documento glTF y devuelve un documento por LOD:
 * materiales spec/gloss a metal/rough (three.js ya no soporta
 * KHR_materials_pbrSpecularGlossiness), limpieza (dedup, prune, weld),
 * simplificación, texturas WebP y Draco.
 */
export async function optimizeDocument(document) {
  document.setLogger(logger);
  const usesSpecGloss = document
    .getRoot()
    .listExtensionsUsed()
    .some((ext) => ext.extensionName === 'KHR_materials_pbrSpecularGlossiness');
  if (usesSpecGloss) await document.transform(metalRough());
  await document.transform(dedup(), prune(), weld());

  const lods = [];
  for (const level of LOD_LEVELS) {
    const lod = cloneDocument(document).setLogger(logger);
    const transforms = [];

    if (level.ratio < 1) {
      transforms.push(
        simplify({
          simplifier: MeshoptSimplifier,
          ratio: level.ratio,
          error: SIMPLIFY_ERROR,
        })
      );
    }
    transforms.push(
      textureCompress({
        encoder: sharp,
        targetFormat: 'webp',
        quality: WEBP_QUALITY,
        resize: [MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE],
      }),
      prune(),
      draco({ method: 'edgebreaker' })
    );

    await lod.transform(...transforms);
    lods.push({ ...level, document: lod });
  }
  return lods;
}

/**
 * Optimiza un GLB y escribe sus LOD en `outputDir` como
 * `<nombre>.glb`, `<nombre>.lod1.glb` y `<nombre>.lod2.glb`.
 * Devuelve el tamaño original y el de cada archivo generado (en bytes).
 */
export async function optimizeFile(inputPath, outputDir, name) {
  const io = await createIO();
  const source = await io.read(inputPath);
  const inputSize = (await stat(inputPath)).size;
  const lods = await optimizeDocument(source);

  await mkdir(outputDir, { recursive: true });
  const outputs = [];
  for (const { suffix, ratio, document } of lods) {
    const outputPath = path.join(outputDir, `${name}${suffix}.glb`);
    await io.write(outputPath, document);
    outputs.push({
      path: outputPath,
      ratio,
      size: (await stat(outputPath)).size,
    });
  }
  return { inputSize, outputs };
}
