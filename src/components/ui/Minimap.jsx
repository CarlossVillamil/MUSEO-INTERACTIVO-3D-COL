import { useEffect } from 'react';
import { CORRIDOR, MUSEUM_BOUNDS, ROOMS } from '../../data/rooms';
import { useMuseumStore } from '../../store/useMuseumStore';

const toRect = ({ minX, maxX, minZ, maxZ }) => ({
  x: minX,
  y: minZ,
  width: maxX - minX,
  height: maxZ - minZ,
});

const shortName = (name) => name.replace(/^Sala (de la )?/, '');

/** Plano 2D del museo visto desde arriba con la ubicación del visitante. */
function MinimapPanel() {
  const playerPosition = useMuseumStore((s) => s.playerPosition);
  const currentRoomId = useMuseumStore((s) => s.currentRoomId);
  const { x, y, width, height } = toRect(MUSEUM_BOUNDS);

  return (
    <aside className="minimap" aria-label="Mapa del museo">
      <svg viewBox={`${x - 1} ${y - 1} ${width + 2} ${height + 2}`}>
        <rect className="minimap__corridor" {...toRect(CORRIDOR)} />
        {ROOMS.map((room) => {
          const rect = toRect(room.bounds);
          return (
            <g key={room.id}>
              <rect
                className={
                  room.id === currentRoomId
                    ? 'minimap__room minimap__room--current'
                    : 'minimap__room'
                }
                {...rect}
              />
              <text
                className="minimap__label"
                x={rect.x + rect.width / 2}
                y={rect.y + rect.height / 2}
              >
                {shortName(room.name)}
              </text>
            </g>
          );
        })}
        <circle
          className="minimap__player"
          cx={playerPosition.x}
          cy={playerPosition.z}
          r={0.7}
        />
      </svg>
      <p>M para cerrar</p>
    </aside>
  );
}

/** Minimapa que se muestra u oculta con la tecla M. */
export default function Minimap() {
  const isMapOpen = useMuseumStore((s) => s.isMapOpen);
  const toggleMap = useMuseumStore((s) => s.toggleMap);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'KeyM' && !event.repeat) toggleMap();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMap]);

  return isMapOpen ? <MinimapPanel /> : null;
}
