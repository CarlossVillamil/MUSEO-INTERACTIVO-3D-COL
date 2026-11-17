import Artifact from './Artifact';
import ExhibitLight from './ExhibitLight';
import Pedestal from './Pedestal';

const PEDESTAL_HEIGHT = 0.9;
const PEDESTAL_WIDTH = 0.7;

/**
 * Vitrina: base, artefacto y su iluminación, ubicada y orientada según
 * `slot`. La luz solo se monta cuando `lit` (sala donde está el visitante),
 * para no superar el límite de sombras de la GPU con todas las vitrinas.
 */
export default function Exhibit({ artifact, slot, lit }) {
  return (
    <group position={[slot.x, 0, slot.z]} rotation={[0, slot.rotationY, 0]}>
      <Pedestal height={PEDESTAL_HEIGHT} width={PEDESTAL_WIDTH} />
      <Artifact artifact={artifact} position={[0, PEDESTAL_HEIGHT, 0]} />
      {lit && (
        <ExhibitLight targetHeight={PEDESTAL_HEIGHT + artifact.size / 2} />
      )}
    </group>
  );
}
