import { useMuseumStore } from '../../store/useMuseumStore';
import { useArtifactModel } from './useArtifactModel';

/**
 * Artefacto seleccionable: muestra su modelo con el material PBR del
 * catálogo, ajustado al tamaño de exhibición y apoyado sobre `position`.
 * Solo escribe en el store global al ser seleccionado.
 */
export default function Artifact({ artifact, position }) {
  const { model, fit } = useArtifactModel(artifact);
  const selectArtifact = useMuseumStore((s) => s.selectArtifact);

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
