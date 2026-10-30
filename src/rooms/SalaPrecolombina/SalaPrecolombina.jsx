import Exhibit from '../../components/three/Exhibit';
import RoomShell from '../../components/three/RoomShell';
import { getArtifactsByRoom } from '../../data/artifacts';

const ROOM_ID = 'sala-precolombina';
const artifacts = getArtifactsByRoom(ROOM_ID);

export default function SalaPrecolombina() {
  return (
    <group name={ROOM_ID}>
      <RoomShell />
      {artifacts.map((artifact) => (
        <Exhibit key={artifact.id} artifact={artifact} />
      ))}
    </group>
  );
}
