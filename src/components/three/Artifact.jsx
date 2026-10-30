import { useMuseumStore } from '../../store/useMuseumStore';

/**
 * Artefacto seleccionable de la escena. Solo escribe en el store global;
 * no sabe nada de la interfaz 2D que mostrará su ficha.
 */
export default function Artifact({ artifact, size, position }) {
  const selectArtifact = useMuseumStore((s) => s.selectArtifact);

  const handleClick = (event) => {
    event.stopPropagation();
    selectArtifact(artifact.id);
  };

  return (
    <mesh
      name={artifact.id}
      position={position}
      castShadow
      onClick={handleClick}
    >
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.35} />
    </mesh>
  );
}
