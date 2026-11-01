import { useEffect, useState } from 'react';
import { useMuseumStore, selectCurrentRoom } from '../../store/useMuseumStore';

const BANNER_DURATION_MS = 3000;

function Banner({ room }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), BANNER_DURATION_MS);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="room-banner" role="status">
      <h2>{room.name}</h2>
      <p>{room.period}</p>
    </div>
  );
}

/**
 * Indicador que aparece al entrar a una sala con su nombre y periodo, y
 * desaparece a los 3 segundos. Se reinicia cada vez que cambia la sala.
 */
export default function RoomBanner() {
  const room = useMuseumStore(selectCurrentRoom);

  if (!room) return null;
  return <Banner key={room.id} room={room} />;
}
