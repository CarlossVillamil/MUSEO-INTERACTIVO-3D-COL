import { getArtifactsByRoom } from '../../data/artifacts';
import { getRoomById } from '../../data/rooms';
import { getExhibitSlots } from '../../scene/layout';
import Exhibit from './Exhibit';
import RoomSign from './RoomSign';

/**
 * Contenedor común de una sala: su señalética en la entrada y una vitrina
 * por cada artefacto del catálogo, en el orden de `data/artifacts.js`.
 */
export default function Room({ roomId }) {
  const room = getRoomById(roomId);
  const slots = getExhibitSlots(room);
  const artifacts = getArtifactsByRoom(roomId);

  return (
    <group name={roomId}>
      <RoomSign room={room} />
      {artifacts.map((artifact, i) => (
        <Exhibit
          key={artifact.id}
          artifact={artifact}
          slot={slots[i]}
          color={room.color}
        />
      ))}
    </group>
  );
}
