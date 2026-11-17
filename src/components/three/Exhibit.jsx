import { PEDESTAL_HEIGHT, PEDESTAL_WIDTH } from '../../scene/layout';
import Artifact from './Artifact';
import Pedestal from './Pedestal';

/**
 * Vitrina: pedestal y artefacto, ubicada y orientada según `slot`. Su luz
 * la gestiona `ExhibitLights` para toda la sala actual.
 */
export default function Exhibit({ artifact, slot, color }) {
  return (
    <group position={[slot.x, 0, slot.z]} rotation={[0, slot.rotationY, 0]}>
      <Pedestal height={PEDESTAL_HEIGHT} width={PEDESTAL_WIDTH} color={color} />
      <Artifact artifact={artifact} position={[0, PEDESTAL_HEIGHT, 0]} />
    </group>
  );
}
