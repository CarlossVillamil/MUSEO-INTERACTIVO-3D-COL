import { MeshStandardMaterial } from 'three';

/**
 * Presets PBR por tipo de material. Se aplican sobre las texturas de cada
 * modelo: los factores multiplican los mapas de metal/rugosidad del GLB.
 * `original` respeta el material tal como viene del modelo.
 *
 * Un metal casi no tiene color difuso: su brillo viene de lo que refleja.
 * `envMapIntensity` refuerza el reflejo del entorno solo en estas piezas,
 * sin aclarar los muros de la sala.
 */
export const MATERIAL_PRESETS = {
  oro: { metalness: 1, roughness: 0.3, envMapIntensity: 4 },
  metal: { metalness: 0.85, roughness: 0.45, envMapIntensity: 2.5 },
  ceramica: { metalness: 0, roughness: 0.75, envMapIntensity: 1 },
  piedra: { metalness: 0, roughness: 0.9, envMapIntensity: 1 },
  original: null,
};

/**
 * Normaliza el material de una pieza a MeshStandardMaterial:
 * - Los materiales sin iluminación (KHR_materials_unlit) ignoran las luces
 *   de las vitrinas; se reemplazan conservando su textura.
 * - Los MeshPhysicalMaterial (specular, ior, clearcoat…) suman mapas de
 *   textura propios; junto con las sombras de los spots de una sala superan
 *   las 16 unidades de textura de la GPU y el shader no compila.
 */
export function toStandardMaterial(material) {
  if (material.isMeshBasicMaterial) {
    return new MeshStandardMaterial({
      name: material.name,
      map: material.map,
      color: material.color,
      transparent: material.transparent,
      opacity: material.opacity,
      alphaTest: material.alphaTest,
      side: material.side,
      vertexColors: material.vertexColors,
      metalness: 0,
      roughness: 0.8,
    });
  }
  if (material.isMeshPhysicalMaterial) {
    return new MeshStandardMaterial().copy(material);
  }
  return material.clone();
}

function prepareMaterial(material, preset, tint) {
  const prepared = toStandardMaterial(material);
  if (preset) {
    prepared.metalness = preset.metalness;
    prepared.roughness = preset.roughness;
    prepared.envMapIntensity = preset.envMapIntensity;
  }
  if (tint) {
    prepared.map = null;
    prepared.color.set(tint);
  }
  return prepared;
}

/**
 * Prepara un modelo para exhibirlo: aplica el preset de material y activa
 * las sombras de todas sus mallas. `tint` reemplaza la textura de color por
 * un color uniforme (p. ej. una pieza genérica representada en oro) y
 * `hiddenMeshes` quita mallas del modelo por nombre.
 */
export function prepareModel(
  root,
  { material = 'original', tint, hiddenMeshes = [] } = {}
) {
  const preset = MATERIAL_PRESETS[material];
  if (preset === undefined) {
    throw new Error(`Preset de material desconocido: ${material}`);
  }

  // Elementos ajenos a la pieza que vienen en el escaneo (soportes, fotos…)
  hiddenMeshes.forEach((name) =>
    root.getObjectByName(name)?.removeFromParent()
  );

  root.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    object.material = Array.isArray(object.material)
      ? object.material.map((m) => prepareMaterial(m, preset, tint))
      : prepareMaterial(object.material, preset, tint);
  });
  return root;
}

/**
 * Escala y desplazamiento para que un modelo, cuya caja envolvente es `box`,
 * mida `size` metros en su dimensión mayor, quede centrado en X/Z y apoyado
 * sobre y = 0.
 */
export function fitToSize(box, size) {
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  const depth = box.max.z - box.min.z;
  const scale = size / Math.max(width, height, depth);
  const centerX = (box.min.x + box.max.x) / 2;
  const centerZ = (box.min.z + box.max.z) / 2;

  return {
    scale,
    position: [-centerX * scale, -box.min.y * scale, -centerZ * scale],
  };
}
