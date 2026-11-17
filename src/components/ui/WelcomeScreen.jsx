import { ROOMS } from '../../data/rooms';
import { useMuseumStore } from '../../store/useMuseumStore';
import ControlsList from './ControlsList';

/** Nombre corto de la sala para el recorrido («Sala de la Colonia» → «Colonia»). */
const shortName = (name) => name.replace(/^Sala (de la )?/, '');

/**
 * Pantalla de bienvenida: presenta el museo y su recorrido mientras la
 * escena carga. Al terminar, el fondo se abre y deja ver el claustro detrás,
 * y aparece «Entrar al museo».
 */
export default function WelcomeScreen() {
  const hasEntered = useMuseumStore((s) => s.hasEntered);
  const isSceneReady = useMuseumStore((s) => s.isSceneReady);
  const loadProgress = useMuseumStore((s) => s.loadProgress);
  const enterMuseum = useMuseumStore((s) => s.enterMuseum);

  if (hasEntered) return null;

  const progress = isSceneReady ? 100 : Math.round(loadProgress);

  return (
    <div
      className={isSceneReady ? 'welcome welcome--ready' : 'welcome'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="welcome__content">
        <h1 id="welcome-title" className="welcome__title">
          Museo Interactivo 3D de Colombia
        </h1>
        <p className="welcome__intro">
          Cuatro salas alrededor de un patio, de la orfebrería precolombina a la
          República. Recórrelas en el orden de la historia.
        </p>

        <ol className="route" aria-label="Recorrido">
          {ROOMS.map((room) => (
            <li key={room.id} style={{ '--room-color': room.color }}>
              <span className="route__name">{shortName(room.name)}</span>
              <span className="route__period">{room.period}</span>
            </li>
          ))}
        </ol>

        <div className="welcome__actions">
          {isSceneReady ? (
            <button
              type="button"
              className="button button--primary welcome__enter"
              onClick={enterMuseum}
              autoFocus
            >
              Entrar al museo
            </button>
          ) : (
            <p className="welcome__status" aria-live="polite">
              Preparando las salas, {progress} %
            </p>
          )}
          <ControlsList className="welcome__controls" />
        </div>
      </div>

      <div
        className="welcome__progress"
        role="progressbar"
        aria-label="Cargando el museo"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        style={{ '--progress': progress / 100 }}
      />
    </div>
  );
}
