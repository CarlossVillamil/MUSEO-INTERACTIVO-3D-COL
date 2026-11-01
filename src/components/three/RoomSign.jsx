import { Text } from '@react-three/drei';
import fontUrl from '@fontsource/cinzel/files/cinzel-latin-600-normal.woff?url';
import { DOOR_HEIGHT, WALL_HEIGHT, getDoor } from '../../scene/layout';

const SIGN_WIDTH = 2.8;
const SIGN_HEIGHT = 1.1;
// Separación del letrero respecto al eje del muro (medio grosor + holgura)
const WALL_CLEARANCE = 0.13;

/**
 * Señalética 3D de una sala: placa sobre el dintel de su puerta, del lado del
 * pasillo, con el nombre y el periodo histórico.
 */
export default function RoomSign({ room }) {
  const door = getDoor(room);
  const position = [
    door.x + door.facing * WALL_CLEARANCE,
    (DOOR_HEIGHT + WALL_HEIGHT) / 2,
    door.z,
  ];

  return (
    <group position={position} rotation={[0, (door.facing * Math.PI) / 2, 0]}>
      <mesh>
        <boxGeometry args={[SIGN_WIDTH, SIGN_HEIGHT, 0.04]} />
        <meshStandardMaterial color="#1d1d1d" />
      </mesh>
      {/* El nombre crece hacia arriba si ocupa dos líneas; el periodo va debajo */}
      <Text
        font={fontUrl}
        position={[0, -0.04, 0.03]}
        fontSize={0.2}
        lineHeight={1.1}
        maxWidth={SIGN_WIDTH - 0.2}
        textAlign="center"
        color="#d4af37"
        anchorX="center"
        anchorY="bottom"
      >
        {room.name}
      </Text>
      <Text
        font={fontUrl}
        position={[0, -0.14, 0.03]}
        fontSize={0.16}
        color="#f4efe6"
        anchorX="center"
        anchorY="top"
      >
        {room.period}
      </Text>
    </group>
  );
}
