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
    <div className="inspection-panel" role="toolbar" aria-label="Inspección">
      <h2>{artifact.name}</h2>
      <p>Arrastra para girar · Rueda del mouse para acercar o alejar</p>
      <div className="inspection-panel__actions">
        <button type="button" onClick={resetInspectionView}>
          Restablecer vista
        </button>
        <button type="button" onClick={stopInspection}>
          Volver a la ficha
        </button>
      </div>
    </div>
  );
}
