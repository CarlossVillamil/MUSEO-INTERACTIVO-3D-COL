import Artifact from './Artifact';
import ExhibitLight from './ExhibitLight';
import Pedestal from './Pedestal';

const PEDESTAL_HEIGHT = 0.9;
const PEDESTAL_WIDTH = 0.7;
const ARTIFACT_SIZE = 0.4;

/** Vitrina: base, artefacto y su iluminación. */
export default function Exhibit({ artifact }) {
  const artifactHeight = PEDESTAL_HEIGHT + ARTIFACT_SIZE / 2;

  return (
    <group position={artifact.position}>
      <Pedestal height={PEDESTAL_HEIGHT} width={PEDESTAL_WIDTH} />
      <Artifact
        artifact={artifact}
        size={ARTIFACT_SIZE}
        position={[0, artifactHeight, 0]}
      />
      <ExhibitLight targetHeight={artifactHeight} />
    </group>
  );
}
