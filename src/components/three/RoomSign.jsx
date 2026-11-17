import { Text } from '@react-three/drei';
import nameFontUrl from '@fontsource/newsreader/files/newsreader-latin-500-normal.woff?url';
import numberFontUrl from '@fontsource/newsreader/files/newsreader-latin-400-italic.woff?url';
import {
  DOORS,
  getRoomCenter,
  getRoomNumber,
  getSpaceAt,
} from '../../data/rooms';
import { DOOR_HEIGHT, GALLERY_HEIGHT } from '../../scene/layout';
import { PALETTE } from '../../scene/palette';

// Las letras van pintadas sobre el muro, apenas separadas de su cara
const WALL_CLEARANCE = 0.105;
const SIGN_Y = (DOOR_HEIGHT + GALLERY_HEIGHT) / 2 + 0.02;
// El número queda a la izquierda del eje de la puerta y el nombre a la derecha
const GUTTER = 0.12;

/**
 * Señalética de una sala: rotulada sobre el muro, encima de la puerta por la
 * que se entra en el recorrido y del lado de afuera. Sobre muros encalados
 * usa el color de la sala; sobre el muro de otra sala, cal.
 */
export default function RoomSign({ room }) {
  const door = DOORS.find((d) => d.entrance === room.id);
  const center = getRoomCenter(room);
  // Dirección desde el muro hacia afuera de la sala
  const outward =
    door.axis === 'x'
      ? Math.sign(door.at - center.x)
      : Math.sign(door.at - center.z);
  const across = door.at + outward * WALL_CLEARANCE;
  const position =
    door.axis === 'x'
      ? [across, SIGN_Y, door.center]
      : [door.center, SIGN_Y, across];
  // El texto mira hacia +z; se gira para que mire hacia afuera de la sala
  const rotationY =
    door.axis === 'x' ? (outward * Math.PI) / 2 : outward > 0 ? 0 : Math.PI;

  const outside =
    door.axis === 'x'
      ? { x: door.at + outward * 0.5, z: door.center }
      : { x: door.center, z: door.at + outward * 0.5 };
  const isOnRoomWall = Boolean(getSpaceAt(outside)?.color);
  const color = isOnRoomWall ? PALETTE.cal : room.color;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Text
        font={numberFontUrl}
        position={[-GUTTER, 0, 0]}
        fontSize={0.62}
        color={color}
        anchorX="right"
        anchorY="middle"
      >
        {getRoomNumber(room.id)}
      </Text>
      <Text
        font={nameFontUrl}
        position={[GUTTER, 0.02, 0]}
        fontSize={0.2}
        color={color}
        anchorX="left"
        anchorY="bottom"
      >
        {room.name}
      </Text>
      <Text
        font={numberFontUrl}
        position={[GUTTER, -0.04, 0]}
        fontSize={0.13}
        color={color}
        anchorX="left"
        anchorY="top"
      >
        {room.period}
      </Text>
    </group>
  );
}
