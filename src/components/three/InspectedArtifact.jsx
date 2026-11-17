import { useMemo } from 'react';
import { Center, ContactShadows } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { useArtifactModel } from './useArtifactModel';

// Dimensión mayor (m) con la que se muestra cualquier pieza al inspeccionarla
const INSPECTION_SIZE = 1;

/**
 * Artefacto aislado y centrado en el origen para el modo de inspección, con
 * una sombra suave justo debajo que lo asienta.
 */
export default function InspectedArtifact({ artifact }) {
  const { model, fit } = useArtifactModel(artifact, INSPECTION_SIZE);
  const height = useMemo(
    () => new Box3().setFromObject(model).getSize(new Vector3()).y * fit.scale,
    [model, fit]
  );

  return (
    <>
      <Center>
        <group scale={fit.scale}>
          <primitive object={model} />
        </group>
      </Center>
      <ContactShadows
        position={[0, -height / 2 - 0.002, 0]}
        opacity={0.6}
        scale={2.4}
        blur={2.4}
        far={1}
      />
    </>
  );
}
