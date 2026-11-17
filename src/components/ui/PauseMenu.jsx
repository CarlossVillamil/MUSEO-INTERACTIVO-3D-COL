import { useMuseumStore } from '../../store/useMuseumStore';
import ControlsList from './ControlsList';

/**
 * Pausa: se muestra cuando el visitante libera el cursor con Esc. Un clic
 * en cualquier parte vuelve a capturar el cursor y reanuda. Mientras la
 * ficha técnica está abierta, la pausa no se muestra encima.
 */
export default function PauseMenu() {
  const isPaused = useMuseumStore((s) => s.isPaused && !s.selectedArtifactId);

  if (!isPaused) return null;

  return (
    <div className="pause" role="dialog" aria-labelledby="pause-title">
      <div className="pause__content">
        <h2 id="pause-title">Recorrido en pausa</h2>
        <p>Haz clic en cualquier parte para continuar.</p>
        <ControlsList />
      </div>
    </div>
  );
}
