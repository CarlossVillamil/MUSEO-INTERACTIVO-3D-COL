import { Suspense } from 'react';
import { Canvas, events } from '@react-three/fiber';
import { NeutralToneMapping } from 'three';
import { KeyboardControls, Preload } from '@react-three/drei';
import { SPAWN_POINT } from '../data/rooms';
import { ROOM_COMPONENTS } from '../rooms';
import ExhibitLights from '../components/three/ExhibitLights';
import MuseumShell from '../components/three/MuseumShell';
import { LoadingTracker, SceneReady } from './LoadingTracker';
import MuseumEnvironment from './MuseumEnvironment';
import PatioLight from './PatioLight';
import PostEffects from './PostEffects';
import { PALETTE } from './palette';
import Player from './Player';

const EYE_HEIGHT = 1.6;
// Campo de visión vertical cercano al de una cámara de arquitectura: sin la
// deformación de los gran angulares en los bordes
const CAMERA_FOV = 60;
// Distancia máxima (m) a la que el visitante alcanza una vitrina con el clic
const REACH_DISTANCE = 4;

const KEYBOARD_MAP = [
  { name: 'forward', keys: ['KeyW'] },
  { name: 'backward', keys: ['KeyS'] },
  { name: 'left', keys: ['KeyA'] },
  { name: 'right', keys: ['KeyD'] },
];

/**
 * Con el cursor capturado no hay puntero sobre la pantalla: el visitante
 * apunta con el centro de la vista, así que los clics se lanzan desde ahí.
 */
const createCenterEvents = (store) => ({
  ...events(store),
  compute: (event, state) => {
    state.pointer.set(0, 0);
    state.raycaster.setFromCamera(state.pointer, state.camera);
    state.raycaster.far = REACH_DISTANCE;
  },
});

/** Lienzo 3D: el recinto del museo con todas sus salas y el visitante. */
export default function MuseumScene() {
  return (
    <KeyboardControls map={KEYBOARD_MAP}>
      <Canvas
        shadows="percentage"
        events={createCenterEvents}
        camera={{
          position: [SPAWN_POINT.x, EYE_HEIGHT, SPAWN_POINT.z],
          fov: CAMERA_FOV,
          // Con una rotación explícita R3F no orienta la cámara hacia el
          // origen: el visitante empieza mirando al frente (hacia el patio)
          rotation: [0, 0, 0],
        }}
        gl={{ toneMapping: NeutralToneMapping }}
      >
        <LoadingTracker />
        <color attach="background" args={[PALETTE.cielo]} />
        <ambientLight intensity={0.3} color="#fff4e6" />
        <directionalLight position={[3, 5, 4]} intensity={0.35} />
        <PatioLight />
        <ExhibitLights />
        <Suspense fallback={null}>
          <MuseumEnvironment />
          <MuseumShell />
          {Object.entries(ROOM_COMPONENTS).map(([roomId, RoomComponent]) => (
            <RoomComponent key={roomId} />
          ))}
          {/* Compila los shaders y sube las texturas a la GPU durante la
              carga, no la primera vez que cada pieza entra en cuadro */}
          <Preload all />
          <SceneReady />
        </Suspense>
        <Player />
        <PostEffects />
      </Canvas>
    </KeyboardControls>
  );
}
