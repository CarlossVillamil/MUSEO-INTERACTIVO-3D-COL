import { useMuseumStore } from '../../store/useMuseumStore';

/**
 * Punto de mira en el centro de la pantalla: indica a qué vitrina apunta el
 * visitante mientras recorre el museo con el cursor capturado.
 */
export default function Crosshair() {
  const isNavigating = useMuseumStore(
    (s) => s.hasEntered && !s.isPaused && !s.selectedArtifactId
  );

  if (!isNavigating) return null;

  return <div className="crosshair" aria-hidden="true" />;
}
