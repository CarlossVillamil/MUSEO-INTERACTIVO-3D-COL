import Exhibit from '../../components/three/Exhibit';
import Room from '../../components/three/Room';
import { getArtifactsByRoom } from '../../data/artifacts';

const ROOM_ID = 'sala-precolombina';
const artifacts = getArtifactsByRoom(ROOM_ID);

export default function SalaPrecolombina() {
  return (
    <Room roomId={ROOM_ID}>
      {artifacts.map((artifact) => (
        <Exhibit key={artifact.id} artifact={artifact} />
      ))}
    </Room>
  );
}
