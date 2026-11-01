import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { SPAWN_POINT } from '../data/rooms';
import { ROOM_COMPONENTS } from '../rooms';
import MuseumShell from '../components/three/MuseumShell';
import Player from './Player';

const EYE_HEIGHT = 1.6;

const KEYBOARD_MAP = [
  { name: 'forward', keys: ['KeyW'] },
  { name: 'backward', keys: ['KeyS'] },
  { name: 'left', keys: ['KeyA'] },
  { name: 'right', keys: ['KeyD'] },
];

/** Lienzo 3D: el recinto del museo con todas sus salas y el visitante. */
export default function MuseumScene() {
  return (
    <KeyboardControls map={KEYBOARD_MAP}>
      <Canvas
        shadows="percentage"
        camera={{ position: [SPAWN_POINT.x, EYE_HEIGHT, SPAWN_POINT.z] }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 4]} intensity={0.4} />
        <MuseumShell />
        {Object.entries(ROOM_COMPONENTS).map(([roomId, RoomComponent]) => (
          <RoomComponent key={roomId} />
        ))}
        <Player />
      </Canvas>
    </KeyboardControls>
  );
}
