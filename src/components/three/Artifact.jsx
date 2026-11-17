import { Fragment, useMemo } from 'react';
import { createPortal } from '@react-three/fiber';
import { Outlines } from '@react-three/drei';
import { useMuseumStore, selectIsNavigating } from '../../store/useMuseumStore';
import { useArtifactModel } from './useArtifactModel';

const OUTLINE_COLOR = '#d4af37';
// Grosor en píxeles de pantalla: igual de visible cerca o lejos. En drei el
// grosor se mide en píxeles cuando `screenspace` es false (con true se mide
// en unidades del modelo, que aquí está muy escalado)
const OUTLINE_THICKNESS = 3;

/**
 * Artefacto interactivo: muestra su modelo con el material PBR del
 * catálogo, ajustado al tamaño de exhibición y apoyado sobre `position`.
 * Avisa al store cuando la mira del visitante pasa sobre él (y entonces se
 * resalta con un contorno) y cuando lo selecciona con un clic.
 *
 * Solo responde en la sala donde está el visitante: los rayos de la mira
 * no se detienen en los muros.
 */
export default function Artifact({ artifact, position }) {
  const { model, fit } = useArtifactModel(artifact);
  const selectArtifact = useMuseumStore((s) => s.selectArtifact);
  const aimArtifact = useMuseumStore((s) => s.aimArtifact);
  const clearAim = useMuseumStore((s) => s.clearAim);
  const isHighlighted = useMuseumStore(
    (s) => s.aimedArtifactId === artifact.id && selectIsNavigating(s)
  );

  const meshes = useMemo(() => {
    const found = [];
    model.traverse((object) => object.isMesh && found.push(object));
    return found;
  }, [model]);

  const isInCurrentRoom = () =>
    useMuseumStore.getState().currentRoomId === artifact.roomId;

  const handlePointerOver = (event) => {
    event.stopPropagation();
    if (isInCurrentRoom()) aimArtifact(artifact.id);
  };

  const handlePointerOut = () => clearAim(artifact.id);

  const handleClick = (event) => {
    event.stopPropagation();
    if (isInCurrentRoom()) selectArtifact(artifact.id);
  };

  return (
    <group
      name={artifact.id}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <group position={fit.position} scale={fit.scale}>
        <primitive object={model} />
      </group>
      {isHighlighted &&
        // El contorno se dibuja dentro de cada malla del modelo
        meshes.map((mesh) => (
          <Fragment key={mesh.uuid}>
            {createPortal(
              <Outlines
                angle={0}
                thickness={OUTLINE_THICKNESS}
                color={OUTLINE_COLOR}
              />,
              mesh
            )}
          </Fragment>
        ))}
    </group>
  );
}
