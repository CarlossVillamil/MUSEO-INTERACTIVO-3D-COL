import Artifact from '../../components/three/Artifact';
import RoomShell from '../../components/three/RoomShell';
import { getArtifactsByRoom } from '../../data/artifacts';

const ROOM_ID = 'sala-precolombina';
const artifacts = getArtifactsByRoom(ROOM_ID);

export default function SalaPrecolombina() {
  return (
    <group name={ROOM_ID}>
      <RoomShell />
      {artifacts.map((artifact) => (
        <Artifact key={artifact.id} artifact={artifact} />
      ))}
    </group>
  );
}
