import { useMuseumStore } from '../../store/useMuseumStore';

/**
 * Artefacto seleccionable de la escena. Solo escribe en el store global;
 * no sabe nada de la interfaz 2D que mostrará su ficha.
 */
export default function Artifact({ artifact }) {
  const selectArtifact = useMuseumStore((s) => s.selectArtifact);

  const handleClick = (event) => {
    event.stopPropagation();
    selectArtifact(artifact.id);
  };

  return (
    <mesh name={artifact.id} position={artifact.position} onClick={handleClick}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#d4af37" />
    </mesh>
  );
}
