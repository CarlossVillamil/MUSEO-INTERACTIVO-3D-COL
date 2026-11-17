import { useEffect, useState } from 'react';
import { getRoomNumber } from '../../data/rooms';
import { useMuseumStore, selectCurrentRoom } from '../../store/useMuseumStore';

const BANNER_DURATION_MS = 3200;

function Banner({ room }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), BANNER_DURATION_MS);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="room-banner"
      role="status"
      style={{ '--room-color': room.color }}
    >
      <span className="room-banner__number" aria-hidden="true">
        {getRoomNumber(room.id)}
      </span>
      <div>
        <h2>{room.name}</h2>
        <p>{room.period}</p>
      </div>
    </div>
  );
}

/**
 * Indicador que aparece al entrar a una sala con su número en el recorrido,
 * su nombre y su periodo, y se desvanece a los pocos segundos. Se reinicia
 * cada vez que cambia la sala.
 */
export default function RoomBanner() {
  const room = useMuseumStore(selectCurrentRoom);

  if (!room) return null;
  return <Banner key={room.id} room={room} />;
}
