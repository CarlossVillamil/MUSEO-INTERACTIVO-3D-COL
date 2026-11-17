import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3 } from 'three';
import { MODELS_BASE_URL } from '../../data/artifacts';
import { fitToSize, prepareModel } from '../../scene/materials';
import { useMuseumStore } from '../../store/useMuseumStore';

// Decodificador Draco servido localmente (copiado de three/examples/jsm/libs)
const DRACO_DECODER_PATH = '/draco/';

/**
 * Artefacto seleccionable: carga su modelo GLB optimizado, le aplica el
 * material PBR del catálogo y lo ajusta al tamaño de exhibición, apoyado
 * sobre `position`. Solo escribe en el store global al ser seleccionado.
 */
export default function Artifact({ artifact, position }) {
  const { scene } = useGLTF(
    MODELS_BASE_URL + artifact.model,
    DRACO_DECODER_PATH
  );
  const selectArtifact = useMuseumStore((s) => s.selectArtifact);

  const { model, fit } = useMemo(() => {
    const root = prepareModel(scene.clone(true), artifact);
    if (artifact.rotation) root.rotation.set(...artifact.rotation);
    root.updateMatrixWorld(true);
    return {
      model: root,
      fit: fitToSize(new Box3().setFromObject(root), artifact.size),
    };
  }, [scene, artifact]);

  // Solo se abren las fichas de la sala en la que está el visitante
  // (el rayo del clic no se detiene en los muros)
  const handleClick = (event) => {
    event.stopPropagation();
    if (useMuseumStore.getState().currentRoomId !== artifact.roomId) return;
    selectArtifact(artifact.id);
  };

  return (
    <group name={artifact.id} position={position} onClick={handleClick}>
      <group position={fit.position} scale={fit.scale}>
        <primitive object={model} />
      </group>
    </group>
  );
}
