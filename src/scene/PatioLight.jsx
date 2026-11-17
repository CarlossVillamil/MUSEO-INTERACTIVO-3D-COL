import { useState } from 'react';
import { Object3D } from 'three';
import { PATIO_CENTER } from './layout';

const LIGHT_HEIGHT = 14;

/**
 * Luz de día sobre el patio abierto: un cono vertical que cubre el patio y
 * casi no alcanza el interior de las salas vecinas (sin sombras, para no
 * sumar mapas de sombra a los de las vitrinas).
 */
export default function PatioLight() {
  const [target] = useState(() => {
    const object = new Object3D();
    object.position.set(PATIO_CENTER.x, 0, PATIO_CENTER.z);
    return object;
  });

  return (
    <>
      <primitive object={target} />
      <spotLight
        target={target}
        position={[PATIO_CENTER.x, LIGHT_HEIGHT, PATIO_CENTER.z]}
        angle={0.5}
        penumbra={0.9}
        intensity={1100}
        decay={2}
        color="#fff3e0"
      />
    </>
  );
}
