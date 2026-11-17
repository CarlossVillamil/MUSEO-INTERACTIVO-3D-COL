import { PALETTE, mixColors } from '../../scene/palette';

// Zócalo retraído bajo el pedestal: deja una línea de sombra sobre el piso
const TOE_HEIGHT = 0.06;
const TOE_INSET = 0.03;

/**
 * Pedestal de la vitrina, del color de los muros de su sala, apenas más
 * claro.
 */
export default function Pedestal({ height, width, color }) {
  const body = mixColors(color, PALETTE.cal, 0.12);
  const toe = mixColors(color, '#000000', 0.35);
  const bodyHeight = height - TOE_HEIGHT;

  return (
    <group>
      <mesh position={[0, TOE_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry
          args={[width - TOE_INSET * 2, TOE_HEIGHT, width - TOE_INSET * 2]}
        />
        <meshStandardMaterial color={toe} roughness={0.9} />
      </mesh>
      <mesh
        position={[0, TOE_HEIGHT + bodyHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, bodyHeight, width]} />
        <meshStandardMaterial color={body} roughness={0.75} />
      </mesh>
    </group>
  );
}
