import { useEffect } from 'react';
import {
  useMuseumStore,
  selectSelectedArtifact,
} from '../../store/useMuseumStore';

/**
 * Ficha técnica del artefacto seleccionado: nombre, época, cultura y
 * descripción. Desde ella se abre el modo de inspección, y se cierra con el
 * botón Cerrar o con Esc. Solo lee y escribe
 * en el store global; no depende de la escena 3D.
 */
export default function ArtifactCard() {
  const artifact = useMuseumStore(selectSelectedArtifact);
  const clearSelection = useMuseumStore((s) => s.clearSelection);
  const startInspection = useMuseumStore((s) => s.startInspection);
  // Durante la inspección la ficha se oculta (y Esc vuelve a ella)
  const isInspecting = useMuseumStore((s) => s.isInspecting);
  const isOpen = artifact !== null && !isInspecting;

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') clearSelection();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, clearSelection]);

  if (!isOpen) return null;

  return (
    <aside
      className="artifact-card"
      role="dialog"
      aria-labelledby="artifact-card-title"
    >
      <h2 id="artifact-card-title">{artifact.name}</h2>
      <dl>
        <dt>Época</dt>
        <dd>{artifact.period}</dd>
        <dt>Cultura</dt>
        <dd>{artifact.culture}</dd>
      </dl>
      <p>{artifact.description}</p>
      <div className="artifact-card__actions">
        <button type="button" onClick={startInspection}>
          Inspeccionar en 3D
        </button>
        <button type="button" onClick={clearSelection}>
          Cerrar
        </button>
      </div>
    </aside>
  );
}
