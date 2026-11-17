import { PEDESTAL_HEIGHT } from '../../scene/layout';
import Artifact from './Artifact';
import Pedestal from './Pedestal';

const PEDESTAL_WIDTH = 0.7;

/**
 * Vitrina: base y artefacto, ubicada y orientada según `slot`. Su luz la
 * gestiona `ExhibitLights` para toda la sala actual.
 */
export default function Exhibit({ artifact, slot }) {
  return (
    <group position={[slot.x, 0, slot.z]} rotation={[0, slot.rotationY, 0]}>
      <Pedestal height={PEDESTAL_HEIGHT} width={PEDESTAL_WIDTH} />
      <Artifact artifact={artifact} position={[0, PEDESTAL_HEIGHT, 0]} />
    </group>
  );
}
