import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3 } from 'three';
import { MODELS_BASE_URL } from '../../data/artifacts';
import { fitToSize, prepareModel } from '../../scene/materials';

// Decodificador Draco servido localmente (copiado de three/examples/jsm/libs)
const DRACO_DECODER_PATH = '/draco/';

/**
 * Carga el modelo GLB optimizado de un artefacto, le aplica el material PBR
 * del catálogo y calcula cómo ajustarlo a `size` metros apoyado en y = 0.
 * Cada llamada trabaja sobre su propia copia del modelo y libera sus
 * materiales al desmontarse.
 */
export function useArtifactModel(artifact, size = artifact.size) {
  const { scene } = useGLTF(
    MODELS_BASE_URL + artifact.model,
    DRACO_DECODER_PATH
  );

  const { model, fit } = useMemo(() => {
    const root = prepareModel(scene.clone(true), artifact);
    if (artifact.rotation) root.rotation.set(...artifact.rotation);
    root.updateMatrixWorld(true);
    return {
      model: root,
      fit: fitToSize(new Box3().setFromObject(root), size),
    };
  }, [scene, artifact, size]);

  useEffect(
    () => () =>
      model.traverse((object) => {
        if (!object.isMesh) return;
        [object.material].flat().forEach((material) => material.dispose());
      }),
    [model]
  );

  return { model, fit };
}
