import { Canvas } from '@react-three/fiber';
import { useMuseumStore } from '../store/useMuseumStore';
import { ROOM_COMPONENTS } from '../rooms';

/** Lienzo 3D: monta la sala activa según el estado global. */
export default function MuseumScene() {
  const currentRoomId = useMuseumStore((s) => s.currentRoomId);
  const CurrentRoom = ROOM_COMPONENTS[currentRoomId];

  return (
    <Canvas camera={{ position: [0, 1, 5] }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} />
      {CurrentRoom && <CurrentRoom />}
    </Canvas>
  );
}
