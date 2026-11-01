import { useMuseumStore } from '../../store/useMuseumStore';

const CONTROLS = [
  { keys: ['W', 'A', 'S', 'D'], action: 'Moverse por el museo' },
  { keys: ['Mouse'], action: 'Mirar alrededor' },
  { keys: ['Clic'], action: 'Ver la ficha de un artefacto' },
  { keys: ['M'], action: 'Mostrar u ocultar el mapa' },
  { keys: ['Esc'], action: 'Pausar y liberar el cursor' },
];

function LoadingBar({ progress }) {
  return (
    <div className="welcome__loading">
      <div
        className="welcome__progress"
        role="progressbar"
        aria-label="Cargando el museo"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="welcome__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p>Cargando el museo… {progress}%</p>
    </div>
  );
}

/**
 * Pantalla de bienvenida: explica los controles mientras la escena carga
 * (con barra de progreso) y, al terminar, ofrece el botón «Entrar al museo».
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
      className="welcome"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="welcome__panel">
        <h1 id="welcome-title">Museo Interactivo 3D de Colombia</h1>
        <p className="welcome__intro">
          Recorre las salas Precolombina, de la Colonia, de la Independencia y
          de la República.
        </p>

        <h2>Controles</h2>
        <ul className="welcome__controls">
          {CONTROLS.map(({ keys, action }) => (
            <li key={action}>
              <span className="welcome__keys">
                {keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ul>

        {isSceneReady ? (
          <button
            type="button"
            className="welcome__enter"
            onClick={enterMuseum}
            autoFocus
          >
            Entrar al museo
          </button>
        ) : (
          <LoadingBar progress={progress} />
        )}
      </div>
    </div>
  );
}
