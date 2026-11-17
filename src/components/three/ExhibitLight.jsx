import { useLayoutEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D, Vector3 } from 'three';
import {
  dampIntensity,
  getHorizontalDistance,
  getTargetIntensity,
} from '../../scene/proximity';

const LIGHT_LEVELS = { near: 30, far: 8 };

const exhibitPosition = new Vector3();

/**
 * Spotlight de una vitrina: apunta al artefacto, proyecta su sombra y
 * aumenta su intensidad gradualmente cuando el visitante se acerca.
 *
 * `placement` ({ position, target }) la ubica sobre una vitrina; sin
 * vitrina asignada se apaga gradualmente. Las piezas no se mueven, así que
 * la sombra se calcula una sola vez cada vez que la luz cambia de vitrina.
 */
export default function ExhibitLight({ placement }) {
  const lightRef = useRef(null);
  const [target] = useState(() => new Object3D());

  // El mapa de sombra se crea al calcularla por primera vez. Sin él, los
  // shaders de todo el museo muestrean una sombra inexistente y la escena se
  // dibuja negra, así que se calcula al montar aunque la luz no tenga
  // vitrina asignada (en el pasillo)
  useLayoutEffect(() => {
    lightRef.current.shadow.needsUpdate = true;
  }, []);

  useLayoutEffect(() => {
    const light = lightRef.current;
    if (!placement || !light) return;
    light.position.set(...placement.position);
    target.position.set(...placement.target);
    target.updateMatrixWorld();
    light.shadow.needsUpdate = true;
  }, [placement, target]);

  useFrame((state, delta) => {
    const light = lightRef.current;
    if (!light) return;

    let goal = 0;
    if (placement) {
      target.getWorldPosition(exhibitPosition);
      const distance = getHorizontalDistance(
        state.camera.position,
        exhibitPosition
      );
      goal = getTargetIntensity(distance, LIGHT_LEVELS);
    }
    light.intensity = dampIntensity(light.intensity, goal, delta);
  });

  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={lightRef}
        target={target}
        intensity={0}
        angle={0.4}
        penumbra={0.5}
        distance={6}
        castShadow
        shadow-autoUpdate={false}
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0005}
      />
    </>
  );
}
