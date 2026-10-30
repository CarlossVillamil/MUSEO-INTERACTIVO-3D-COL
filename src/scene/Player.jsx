import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useMuseumStore } from '../store/useMuseumStore';
import { getMoveDirection } from './movement';

const WALK_SPEED = 3; // unidades por segundo
// Margen para que la rotación vertical no llegue a los polos ni invierta la cámara
const PITCH_MARGIN = 0.15;

const direction = new Vector3();

/**
 * Visitante en primera persona: clic en el lienzo captura el cursor,
 * el mouse rota la vista y W/A/S/D desplazan la cámara.
 * Al liberar el cursor (Esc) avisa al store para mostrar la pausa.
 */
export default function Player() {
  const controlsRef = useRef(null);
  const [, getKeys] = useKeyboardControls();
  const pause = useMuseumStore((s) => s.pause);
  const resume = useMuseumStore((s) => s.resume);

  useFrame((state, delta) => {
    if (!controlsRef.current?.isLocked) return;

    getMoveDirection(getKeys(), state.camera, direction);
    state.camera.position.addScaledVector(direction, WALK_SPEED * delta);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      minPolarAngle={PITCH_MARGIN}
      maxPolarAngle={Math.PI - PITCH_MARGIN}
      onLock={resume}
      onUnlock={pause}
    />
  );
}
