import { useMuseumStore, selectIsNavigating } from '../../store/useMuseumStore';

/**
 * Punto de mira en el centro de la pantalla: indica a qué vitrina apunta el
 * visitante mientras recorre el museo con el cursor capturado. Sobre un
 * objeto interactivo se agranda e invita a hacer clic.
 */
export default function Crosshair() {
  const isNavigating = useMuseumStore(selectIsNavigating);
  const isAiming = useMuseumStore((s) => s.aimedArtifactId !== null);

  if (!isNavigating) return null;

  return (
    <div className={isAiming ? 'crosshair crosshair--active' : 'crosshair'}>
      {isAiming && <p className="crosshair__hint">Clic para ver más</p>}
    </div>
  );
}
