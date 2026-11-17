import { CORRIDOR, ROOMS, getRoomCenter } from '../data/rooms';

export const WALL_HEIGHT = 4;
export const DOOR_WIDTH = 3;
export const DOOR_HEIGHT = 2.6;

/**
 * Segmento de muro sobre el piso, de `from` a `to` ([x, z]), que ocupa
 * verticalmente de `bottom` a `top`.
 */
const wall = (from, to, bottom = 0, top = WALL_HEIGHT) => ({
  from,
  to,
  bottom,
  top,
});

/** Muro con un vano de puerta centrado: dos tramos laterales y un dintel. */
function wallWithDoor(from, to, doorCenter) {
  const vertical = from[0] === to[0];
  const axis = vertical ? 1 : 0;
  const start = Math.min(from[axis], to[axis]);
  const end = Math.max(from[axis], to[axis]);
  const doorStart = doorCenter - DOOR_WIDTH / 2;
  const doorEnd = doorCenter + DOOR_WIDTH / 2;
  const point = (value) => (vertical ? [from[0], value] : [value, from[1]]);

  return [
    wall(point(start), point(doorStart)),
    wall(point(doorEnd), point(end)),
    wall(point(doorStart), point(doorEnd), DOOR_HEIGHT, WALL_HEIGHT),
  ];
}

/** Posición y orientación de la puerta de una sala (sobre el pasillo). */
export function getDoor({ bounds, doorSide }) {
  const x = doorSide === 'east' ? bounds.maxX : bounds.minX;
  const z = (bounds.minZ + bounds.maxZ) / 2;
  // Dirección (en x) hacia la que mira la puerta desde la sala: hacia el pasillo
  const facing = doorSide === 'east' ? 1 : -1;
  return { x, z, facing };
}

const segmentKey = ({ from, to, bottom, top }) => {
  const [a, b] = [from.join(','), to.join(',')].sort();
  return `${a}|${b}|${bottom}|${top}`;
};

/**
 * Genera todos los tramos de muro del museo: las cuatro paredes de cada sala
 * (con su puerta hacia el pasillo) y el cierre del pasillo. Los muros
 * compartidos entre salas se incluyen una sola vez.
 */
export function getWallSegments(rooms = ROOMS, corridor = CORRIDOR) {
  const segments = [];

  rooms.forEach((room) => {
    const { minX, maxX, minZ, maxZ } = room.bounds;
    const door = getDoor(room);
    const sides = {
      north: [
        [minX, minZ],
        [maxX, minZ],
      ],
      south: [
        [minX, maxZ],
        [maxX, maxZ],
      ],
      west: [
        [minX, minZ],
        [minX, maxZ],
      ],
      east: [
        [maxX, minZ],
        [maxX, maxZ],
      ],
    };

    Object.entries(sides).forEach(([side, [from, to]]) => {
      if (side === room.doorSide) {
        segments.push(...wallWithDoor(from, to, door.z));
      } else {
        segments.push(wall(from, to));
      }
    });
  });

  // Tramos de pasillo que no limitan con ninguna sala
  const roomsMaxZ = Math.max(...rooms.map((room) => room.bounds.maxZ));
  const roomsMinZ = Math.min(...rooms.map((room) => room.bounds.minZ));
  [corridor.minX, corridor.maxX].forEach((x) => {
    if (corridor.maxZ > roomsMaxZ) {
      segments.push(wall([x, roomsMaxZ], [x, corridor.maxZ]));
    }
    if (corridor.minZ < roomsMinZ) {
      segments.push(wall([x, corridor.minZ], [x, roomsMinZ]));
    }
  });
  segments.push(
    wall([corridor.minX, corridor.minZ], [corridor.maxX, corridor.minZ]),
    wall([corridor.minX, corridor.maxZ], [corridor.maxX, corridor.maxZ])
  );

  const unique = new Map(segments.map((s) => [segmentKey(s), s]));
  return [...unique.values()];
}

/**
 * Vitrinas de una sala en coordenadas locales (centro de la sala), suponiendo
 * la puerta en el muro +x: tres contra el muro del fondo, dos en cada muro
 * lateral y dos en el centro, dejando libre el paso desde la entrada.
 */
const EXHIBIT_SLOTS = [
  [-4.5, -3.5],
  [-4.5, 0],
  [-4.5, 3.5],
  [-1.5, -4.5],
  [1.5, -4.5],
  [-1.5, 4.5],
  [1.5, 4.5],
  [-1, -1.8],
  [-1, 1.8],
];

// Las piezas miran hacia este punto (cerca de la entrada, dentro de la sala)
const FOCUS_DISTANCE_FROM_CENTER = 2;

export const MAX_EXHIBITS_PER_ROOM = EXHIBIT_SLOTS.length;

/**
 * Posición (x, z) de cada vitrina de una sala y su rotación en Y para que la
 * pieza (cuyo frente es +z) mire hacia la entrada.
 */
export function getExhibitSlots(room) {
  const center = getRoomCenter(room);
  const doorDirection = room.doorSide === 'east' ? 1 : -1;
  const focusX = center.x + FOCUS_DISTANCE_FROM_CENTER * doorDirection;

  return EXHIBIT_SLOTS.map(([localX, localZ]) => {
    const x = center.x + localX * doorDirection;
    const z = center.z + localZ;
    return { x, z, rotationY: Math.atan2(focusX - x, center.z - z) };
  });
}
