import { useEffect } from 'react';
import {
  COMMON_AREAS,
  DOORS,
  MUSEUM_BOUNDS,
  ROOMS,
  getRoomCenter,
  getRoomNumber,
} from '../../data/rooms';
import { useMuseumStore } from '../../store/useMuseumStore';

const toRect = ({ minX, maxX, minZ, maxZ }) => ({
  x: minX,
  y: minZ,
  width: maxX - minX,
  height: maxZ - minZ,
});

/** Vano como línea sobre el plano (para «abrir» el contorno de los espacios). */
const doorLine = ({ axis, at, center, width }) =>
  axis === 'x'
    ? { x1: at, y1: center - width / 2, x2: at, y2: center + width / 2 }
    : { x1: center - width / 2, y1: at, x2: center + width / 2, y2: at };

/** Plano del museo visto desde arriba, con la ubicación del visitante. */
function MinimapPanel() {
  const playerPosition = useMuseumStore((s) => s.playerPosition);
  const currentRoomId = useMuseumStore((s) => s.currentRoomId);
  const { x, y, width, height } = toRect(MUSEUM_BOUNDS);
  const patio = COMMON_AREAS.find((area) => area.openSky);
  const fountain = getRoomCenter(patio);

  return (
    <aside className="plan" aria-label="Plano del museo">
      <svg viewBox={`${x - 1} ${y - 1} ${width + 2} ${height + 2}`}>
        {COMMON_AREAS.map((area) => (
          <rect
            key={area.id}
            className="plan__common"
            {...toRect(area.bounds)}
          />
        ))}
        <circle
          className="plan__fountain"
          cx={fountain.x}
          cy={fountain.z}
          r={1.5}
        />
        {ROOMS.map((room) => {
          const rect = toRect(room.bounds);
          const isCurrent = room.id === currentRoomId;
          return (
            <g key={room.id}>
              <rect
                className={
                  isCurrent ? 'plan__room plan__room--current' : 'plan__room'
                }
                style={{ fill: room.color }}
                {...rect}
              />
              <text
                className="plan__number"
                x={rect.x + rect.width / 2}
                y={rect.y + rect.height / 2}
              >
                {getRoomNumber(room.id)}
              </text>
            </g>
          );
        })}
        {DOORS.map((door, i) => (
          <line key={i} className="plan__door" {...doorLine(door)} />
        ))}
        <circle
          className="plan__visitor"
          cx={playerPosition.x}
          cy={playerPosition.z}
          r={0.8}
        />
      </svg>
      <p>Pulsa M para cerrar el plano</p>
    </aside>
  );
}

/** Plano que se muestra u oculta con la tecla M. */
export default function Minimap() {
  const isMapOpen = useMuseumStore((s) => s.isMapOpen);
  const toggleMap = useMuseumStore((s) => s.toggleMap);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code !== 'KeyM' || event.repeat) return;
      // El plano solo está disponible dentro del museo, no en la bienvenida
      if (useMuseumStore.getState().hasEntered) toggleMap();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMap]);

  return isMapOpen ? <MinimapPanel /> : null;
}
