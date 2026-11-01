import { getRoomById, getRoomCenter } from '../../data/rooms';
import RoomSign from './RoomSign';

/**
 * Contenedor común de una sala: coloca su señalética en la entrada y
 * posiciona el contenido (vitrinas) relativo al centro de la sala.
 */
export default function Room({ roomId, children }) {
  const room = getRoomById(roomId);
  const center = getRoomCenter(room);

  return (
    <group name={roomId}>
      <RoomSign room={room} />
      <group position={[center.x, 0, center.z]}>{children}</group>
    </group>
  );
}
