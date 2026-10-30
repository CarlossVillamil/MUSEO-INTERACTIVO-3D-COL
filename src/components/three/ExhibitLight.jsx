import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D, Vector3 } from 'three';
import {
  dampIntensity,
  getHorizontalDistance,
  getTargetIntensity,
} from '../../scene/proximity';

const LIGHT_LEVELS = { near: 30, far: 8 };
const LIGHT_HEIGHT = 3.6;
// En diagonal (adelante a la derecha) para que la sombra del artefacto caiga
// sobre su base y se vea desde el frente de la vitrina
const LIGHT_OFFSET = 0.9;

const exhibitPosition = new Vector3();

/**
 * Spotlight de una vitrina: apunta al artefacto, proyecta sombras y
 * aumenta su intensidad gradualmente cuando el visitante se acerca.
 */
export default function ExhibitLight({ targetHeight }) {
  const lightRef = useRef(null);
  const [target] = useState(() => new Object3D());

  useFrame((state, delta) => {
    const light = lightRef.current;
    if (!light) return;

    target.getWorldPosition(exhibitPosition);
    const distance = getHorizontalDistance(
      state.camera.position,
      exhibitPosition
    );
    const goal = getTargetIntensity(distance, LIGHT_LEVELS);
    light.intensity = dampIntensity(light.intensity, goal, delta);
  });

  return (
    <>
      <primitive object={target} position={[0, targetHeight, 0]} />
      <spotLight
        ref={lightRef}
        target={target}
        position={[LIGHT_OFFSET, LIGHT_HEIGHT, LIGHT_OFFSET]}
        intensity={LIGHT_LEVELS.far}
        angle={0.4}
        penumbra={0.5}
        distance={6}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0005}
      />
    </>
  );
}
