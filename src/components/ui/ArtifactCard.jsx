import {
  useMuseumStore,
  selectSelectedArtifact,
} from '../../store/useMuseumStore';

/**
 * Ficha del artefacto seleccionado. Solo lee del store global;
 * no depende de la escena 3D.
 */
export default function ArtifactCard() {
  const artifact = useMuseumStore(selectSelectedArtifact);
  const clearSelection = useMuseumStore((s) => s.clearSelection);

  if (!artifact) return null;

  return (
    <aside className="artifact-card">
      <button type="button" onClick={clearSelection} aria-label="Cerrar ficha">
        ×
      </button>
      <h2>{artifact.name}</h2>
      <p>{artifact.description}</p>
    </aside>
  );
}
