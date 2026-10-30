import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { useMuseumStore } from '../store/useMuseumStore';
import { ROOM_COMPONENTS } from '../rooms';
import Player from './Player';

const EYE_HEIGHT = 1.6;

const KEYBOARD_MAP = [
  { name: 'forward', keys: ['KeyW'] },
  { name: 'backward', keys: ['KeyS'] },
  { name: 'left', keys: ['KeyA'] },
  { name: 'right', keys: ['KeyD'] },
];

/** Lienzo 3D: monta la sala activa según el estado global. */
export default function MuseumScene() {
  const currentRoomId = useMuseumStore((s) => s.currentRoomId);
  const CurrentRoom = ROOM_COMPONENTS[currentRoomId];

  return (
    <KeyboardControls map={KEYBOARD_MAP}>
      <Canvas camera={{ position: [0, EYE_HEIGHT, 5] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]} />
        {CurrentRoom && <CurrentRoom />}
        <Player />
      </Canvas>
    </KeyboardControls>
  );
}
