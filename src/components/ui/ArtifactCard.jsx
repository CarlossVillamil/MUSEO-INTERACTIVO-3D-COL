import { useEffect } from 'react';
import { getRoomById } from '../../data/rooms';
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

  const room = getRoomById(artifact.roomId);

  return (
    <aside
      className="sheet"
      role="dialog"
      aria-labelledby="artifact-card-title"
      style={{ '--room-color': room.color }}
    >
      <h2 id="artifact-card-title" className="sheet__title">
        {artifact.name}
      </h2>
      <dl className="sheet__facts">
        <div>
          <dt>Cultura</dt>
          <dd>{artifact.culture}</dd>
        </div>
        <div>
          <dt>Época</dt>
          <dd>{artifact.period}</dd>
        </div>
      </dl>
      <p className="sheet__description">{artifact.description}</p>
      <div className="sheet__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={startInspection}
          autoFocus
        >
          Inspeccionar en 3D
        </button>
        <button
          type="button"
          className="button button--quiet"
          onClick={clearSelection}
        >
          Cerrar
        </button>
      </div>
    </aside>
  );
}
