import { useEffect } from 'react';
import {
  useMuseumStore,
  selectSelectedArtifact,
} from '../../store/useMuseumStore';

/**
 * Controles del modo de inspección: indica cómo rotar y acercar la pieza,
 * permite restablecer la vista y volver a la ficha (también con Esc).
 */
export default function InspectionPanel() {
  const artifact = useMuseumStore(selectSelectedArtifact);
  const isInspecting = useMuseumStore((s) => s.isInspecting);
  const stopInspection = useMuseumStore((s) => s.stopInspection);
  const resetInspectionView = useMuseumStore((s) => s.resetInspectionView);
  const isOpen = isInspecting && artifact !== null;

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') stopInspection();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stopInspection]);

  if (!isOpen) return null;

  return (
    <div className="inspection" role="toolbar" aria-label="Inspección">
      <h2 className="inspection__title">{artifact.name}</h2>
      <p className="inspection__hint">
        Arrastra para girar la pieza. Usa la rueda para acercarla o alejarla.
      </p>
      <div className="inspection__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={stopInspection}
        >
          Volver a la ficha
        </button>
        <button
          type="button"
          className="button button--quiet"
          onClick={resetInspectionView}
        >
          Restablecer vista
        </button>
      </div>
    </div>
  );
}
