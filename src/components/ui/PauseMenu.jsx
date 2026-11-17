import { useMuseumStore } from '../../store/useMuseumStore';

/**
 * Menú de pausa: se muestra cuando el visitante libera el cursor con Esc.
 * Un clic en cualquier parte vuelve a capturar el cursor y reanuda.
 * Mientras la ficha técnica está abierta, la pausa no se muestra encima.
 */
export default function PauseMenu() {
  const isPaused = useMuseumStore((s) => s.isPaused && !s.selectedArtifactId);

  if (!isPaused) return null;

  return (
    <div className="pause-menu" role="dialog" aria-labelledby="pause-title">
      <h2 id="pause-title">Pausa</h2>
      <p>Haz clic para continuar el recorrido</p>
    </div>
  );
}
