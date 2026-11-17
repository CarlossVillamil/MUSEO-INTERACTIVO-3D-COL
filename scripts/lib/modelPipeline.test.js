import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Document } from '@gltf-transform/core';
import { KHRMaterialsPBRSpecularGlossiness } from '@gltf-transform/extensions';
import sharp from 'sharp';
import {
  LOD_LEVELS,
  createIO,
  findSourceModels,
  optimizeDocument,
  optimizeFile,
} from './modelPipeline.js';

/**
 * Genera un GLB como el que exporta Blender sin optimizar: una esfera densa
 * con normales y UVs en float32, índices uint32 y una textura PNG 1024².
 */
async function createBlenderLikeGlb(filePath) {
  const WIDTH_SEGMENTS = 256;
  const HEIGHT_SEGMENTS = 128;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let y = 0; y <= HEIGHT_SEGMENTS; y++) {
    const v = y / HEIGHT_SEGMENTS;
    for (let x = 0; x <= WIDTH_SEGMENTS; x++) {
      const u = x / WIDTH_SEGMENTS;
      const nx = -Math.cos(u * Math.PI * 2) * Math.sin(v * Math.PI);
      const ny = Math.cos(v * Math.PI);
      const nz = Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI);
      positions.push(nx, ny, nz);
      normals.push(nx, ny, nz);
      uvs.push(u, 1 - v);
    }
  }
  const row = WIDTH_SEGMENTS + 1;
  for (let y = 0; y < HEIGHT_SEGMENTS; y++) {
    for (let x = 0; x < WIDTH_SEGMENTS; x++) {
      const a = y * row + x;
      indices.push(a, a + row, a + 1, a + 1, a + row, a + row + 1);
    }
  }

  const SIZE = 1024;
  const pixels = Buffer.alloc(SIZE * SIZE * 3);
  for (let i = 0; i < SIZE * SIZE; i++) {
    const px = i % SIZE;
    const py = Math.floor(i / SIZE);
    pixels[i * 3] = 180 + 60 * Math.sin(px / 23);
    pixels[i * 3 + 1] = 140 + 50 * Math.sin(py / 31);
    pixels[i * 3 + 2] = 40 + 30 * Math.sin((px + py) / 17);
  }
  const png = await sharp(pixels, {
    raw: { width: SIZE, height: SIZE, channels: 3 },
  })
    .png()
    .toBuffer();

  const document = new Document();
  const buffer = document.createBuffer();
  const accessor = (type, array) =>
    document.createAccessor().setType(type).setArray(array).setBuffer(buffer);
  const texture = document
    .createTexture('base')
    .setImage(new Uint8Array(png))
    .setMimeType('image/png');
  const material = document.createMaterial('oro').setBaseColorTexture(texture);
  const primitive = document
    .createPrimitive()
    .setAttribute('POSITION', accessor('VEC3', new Float32Array(positions)))
    .setAttribute('NORMAL', accessor('VEC3', new Float32Array(normals)))
    .setAttribute('TEXCOORD_0', accessor('VEC2', new Float32Array(uvs)))
    .setIndices(accessor('SCALAR', new Uint32Array(indices)))
    .setMaterial(material);
  const mesh = document.createMesh('artefacto').addPrimitive(primitive);
  const node = document.createNode('artefacto').setMesh(mesh);
  document.createScene().addChild(node);

  const io = await createIO();
  await io.write(filePath, document);
}

const triangleCount = (document) =>
  document
    .getRoot()
    .listMeshes()
    .flatMap((mesh) => mesh.listPrimitives())
    .reduce((sum, primitive) => sum + primitive.getIndices().getCount() / 3, 0);

describe('pipeline de optimización de modelos', () => {
  let tempDir;
  let result;

  beforeAll(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'model-pipeline-'));
    const sourcePath = path.join(tempDir, 'artefacto.glb');
    await createBlenderLikeGlb(sourcePath);
    result = await optimizeFile(
      sourcePath,
      path.join(tempDir, 'out'),
      'artefacto'
    );
  }, 60_000);

  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  // Escenario: Optimizar modelo
  it('reduce el peso del GLB exportado en al menos 50%', () => {
    const [lod0] = result.outputs;
    expect(lod0.size).toBeLessThanOrEqual(result.inputSize * 0.5);
  });

  it('genera un archivo por cada nivel de detalle', () => {
    expect(result.outputs.map((o) => path.basename(o.path))).toEqual([
      'artefacto.glb',
      'artefacto.lod1.glb',
      'artefacto.lod2.glb',
    ]);
    expect(result.outputs).toHaveLength(LOD_LEVELS.length);
  });

  it('comprime la geometría con Draco y las texturas a WebP', async () => {
    const io = await createIO();
    const lod0 = await io.read(result.outputs[0].path);
    const extensions = lod0
      .getRoot()
      .listExtensionsUsed()
      .map((extension) => extension.extensionName);

    expect(extensions).toContain('KHR_draco_mesh_compression');
    expect(extensions).toContain('EXT_texture_webp');
    expect(
      lod0
        .getRoot()
        .listTextures()
        .map((t) => t.getMimeType())
    ).toEqual(['image/webp']);
  });

  it('cada LOD tiene menos triángulos que el anterior', async () => {
    const io = await createIO();
    const counts = [];
    for (const output of result.outputs) {
      counts.push(triangleCount(await io.read(output.path)));
    }
    expect(counts[1]).toBeLessThan(counts[0]);
    expect(counts[2]).toBeLessThan(counts[1]);
  });
});

describe('findSourceModels', () => {
  let tempDir;

  beforeAll(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'model-sources-'));
    await mkdir(path.join(tempDir, 'independencia'));
    await mkdir(path.join(tempDir, 'pre-colombina'));
    await writeFile(path.join(tempDir, 'suelto.glb'), '');
    await writeFile(path.join(tempDir, 'independencia', 'florero.glb'), '');
    await writeFile(path.join(tempDir, 'pre-colombina', 'balsa.GLB'), '');
    await writeFile(path.join(tempDir, 'pre-colombina', 'notas.txt'), '');
  });

  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('encuentra los GLB de la raíz y de las subcarpetas por sala', async () => {
    const models = await findSourceModels(tempDir);
    const found = models
      .map(({ relativeDir, name }) => path.join(relativeDir, name))
      .sort();

    expect(found).toEqual([
      path.join('independencia', 'florero'),
      path.join('pre-colombina', 'balsa'),
      'suelto',
    ]);
  });
});

describe('materiales', () => {
  it('convierte spec/gloss (no soportado por three.js) a metal/rough', async () => {
    const document = new Document();
    const specGloss = document.createExtension(
      KHRMaterialsPBRSpecularGlossiness
    );
    const material = document
      .createMaterial('colgante')
      .setExtension(
        'KHR_materials_pbrSpecularGlossiness',
        specGloss.createPBRSpecularGlossiness()
      );
    const position = document
      .createAccessor()
      .setType('VEC3')
      .setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]));
    const primitive = document
      .createPrimitive()
      .setAttribute('POSITION', position)
      .setMaterial(material);
    document
      .createScene()
      .addChild(
        document
          .createNode()
          .setMesh(document.createMesh().addPrimitive(primitive))
      );

    const [lod0] = await optimizeDocument(document);
    const extensions = lod0.document
      .getRoot()
      .listExtensionsUsed()
      .map((extension) => extension.extensionName);

    expect(extensions).not.toContain('KHR_materials_pbrSpecularGlossiness');
  });
});
