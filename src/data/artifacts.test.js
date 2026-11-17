import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { createIO } from '../../scripts/lib/modelPipeline.js';
import { MATERIAL_PRESETS } from '../scene/materials';
import { MAX_EXHIBITS_PER_ROOM } from '../scene/layout';
import { ARTIFACTS, getArtifactsByRoom } from './artifacts';
import { ROOMS } from './rooms';

const MODEL_SIZE_LIMIT = 5 * 1024 * 1024;
const modelPath = (artifact) =>
  path.join('public', 'models', ...artifact.model.split('/'));

describe('catálogo de artefactos', () => {
  it('los identificadores son únicos', () => {
    const ids = ARTIFACTS.map((artifact) => artifact.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada sala tiene al menos 5 artefactos y caben en sus vitrinas', () => {
    ROOMS.forEach((room) => {
      const count = getArtifactsByRoom(room.id).length;
      expect(count, room.id).toBeGreaterThanOrEqual(5);
      expect(count, room.id).toBeLessThanOrEqual(MAX_EXHIBITS_PER_ROOM);
    });
  });

  it('cada artefacto tiene ficha, material válido, tamaño y crédito', () => {
    ARTIFACTS.forEach((artifact) => {
      expect(artifact.name, artifact.id).toBeTruthy();
      expect(artifact.description, artifact.id).toBeTruthy();
      expect(MATERIAL_PRESETS, artifact.id).toHaveProperty(artifact.material);
      expect(artifact.size, artifact.id).toBeGreaterThan(0);
      expect(artifact.source.author, artifact.id).toBeTruthy();
      expect(artifact.source.license, artifact.id).toMatch(/^CC/);
      expect(artifact.source.url, artifact.id).toMatch(/^https:\/\//);
    });
  });
});

// Escenario: Carga de artefactos
describe('modelos 3D de los artefactos', () => {
  let io;

  beforeAll(async () => {
    io = await createIO();
  });

  it('cada modelo existe y pesa menos de 5 MB', () => {
    ARTIFACTS.forEach((artifact) => {
      const file = modelPath(artifact);
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size, file).toBeLessThan(MODEL_SIZE_LIMIT);
    });
  });

  it('cada modelo carga completo, con geometría y sin texturas faltantes', async () => {
    for (const artifact of ARTIFACTS) {
      const document = await io.read(modelPath(artifact));
      const root = document.getRoot();

      expect(root.listMeshes().length, artifact.id).toBeGreaterThan(0);
      root.listTextures().forEach((texture) => {
        expect(texture.getImage()?.byteLength, artifact.id).toBeGreaterThan(0);
        expect(texture.getSize(), artifact.id).not.toBeNull();
      });
    }
  }, 60_000);
});
