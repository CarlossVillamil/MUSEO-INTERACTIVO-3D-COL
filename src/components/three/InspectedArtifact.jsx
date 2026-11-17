import { Center } from '@react-three/drei';
import { useArtifactModel } from './useArtifactModel';

// Dimensión mayor (m) con la que se muestra cualquier pieza al inspeccionarla
const INSPECTION_SIZE = 1;

/** Artefacto aislado y centrado en el origen para el modo de inspección. */
export default function InspectedArtifact({ artifact }) {
  const { model, fit } = useArtifactModel(artifact, INSPECTION_SIZE);

  return (
    <Center>
      <group scale={fit.scale}>
        <primitive object={model} />
      </group>
    </Center>
  );
}
