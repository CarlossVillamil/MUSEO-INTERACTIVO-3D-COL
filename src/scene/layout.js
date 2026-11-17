import { COMMON_AREAS, DOORS, SPACES, getRoomCenter } from '../data/rooms';

export const WALL_HEIGHT = 4;
export const DOOR_HEIGHT = 2.7;
// Altura del techo de la galería que rodea el patio (claustro)
export const GALLERY_HEIGHT = 3.5;
// Distancia de la columnata a los muros del patio
export const GALLERY_DEPTH = 1.8;

const SIDE_PROBE = 0.1;

/**
 * Tramos de muro del museo. Cada tramo está sobre una línea (`axis` 'x' si
 * tiene x constante, 'z' si tiene z constante) en la coordenada `at`, va de
 * `from` a `to` sobre esa línea y ocupa de `bottom` a `top` en altura.
 * `sides` indica el espacio a cada lado ([lado negativo, lado positivo];
 * null es el exterior), para pintar cada cara con el color de su espacio.
 * Los vanos de `DOORS` cortan los tramos y dejan un dintel encima.
 */
export function getWallSegments(spaces = SPACES, doors = DOORS) {
  // Bordes de cada espacio agrupados por la línea sobre la que están
  const lines = new Map();
  const addEdge = (axis, at, from, to) => {
    const key = `${axis}:${at}`;
    if (!lines.has(key)) lines.set(key, { axis, at, edges: [] });
    lines.get(key).edges.push([from, to]);
  };
  spaces.forEach(({ bounds: { minX, maxX, minZ, maxZ } }) => {
    addEdge('x', minX, minZ, maxZ);
    addEdge('x', maxX, minZ, maxZ);
    addEdge('z', minZ, minX, maxX);
    addEdge('z', maxZ, minX, maxX);
  });

  const spaceIdAt = (point) =>
    spaces.find(
      ({ bounds: b }) =>
        point.x > b.minX &&
        point.x < b.maxX &&
        point.z > b.minZ &&
        point.z < b.maxZ
    )?.id ?? null;
  const pointOn = (axis, at, along, offset = 0) =>
    axis === 'x' ? { x: at + offset, z: along } : { x: along, z: at + offset };

  const walls = [];
  lines.forEach(({ axis, at, edges }) => {
    // Cortes donde empieza o termina algún borde: entre dos cortes, el muro
    // separa siempre los mismos dos espacios
    const cuts = [...new Set(edges.flat())].sort((a, b) => a - b);
    for (let i = 0; i < cuts.length - 1; i++) {
      const [from, to] = [cuts[i], cuts[i + 1]];
      const middle = (from + to) / 2;
      if (!edges.some(([a, b]) => a <= middle && middle <= b)) continue;
      const sides = [
        spaceIdAt(pointOn(axis, at, middle, -SIDE_PROBE)),
        spaceIdAt(pointOn(axis, at, middle, SIDE_PROBE)),
      ];
      walls.push({ axis, at, from, to, sides });
    }
  });

  return walls.flatMap((segment) => cutDoors(segment, doors));
}

/** Corta un tramo de muro con los vanos que caen sobre él. */
function cutDoors(segment, doors) {
  const { axis, at, from, to } = segment;
  const openings = doors
    .filter(
      (door) =>
        door.axis === axis &&
        door.at === at &&
        door.center > from &&
        door.center < to
    )
    .sort((a, b) => a.center - b.center);

  const pieces = [];
  let start = from;
  openings.forEach((door) => {
    const doorStart = door.center - door.width / 2;
    const doorEnd = door.center + door.width / 2;
    pieces.push({ ...segment, from: start, to: doorStart });
    pieces.push({
      ...segment,
      from: doorStart,
      to: doorEnd,
      bottom: DOOR_HEIGHT,
      isLintel: true,
    });
    start = doorEnd;
  });
  pieces.push({ ...segment, from: start, to });

  return pieces
    .filter((piece) => piece.to - piece.from > 1e-6)
    .map((piece) => ({ bottom: 0, top: WALL_HEIGHT, ...piece }));
}

/** Vanos de un muro de sala, como desplazamiento sobre el muro desde su centro. */
function doorsOnWall(axis, at, from, to, doors) {
  const middle = (from + to) / 2;
  return doors
    .filter(
      (door) =>
        door.axis === axis &&
        door.at === at &&
        door.center > from &&
        door.center < to
    )
    .map((door) => ({ offset: door.center - middle, width: door.width }));
}

// Vitrinas por muro: posiciones candidatas sobre el muro (desde su centro)
// y separación de las vitrinas respecto del muro
const WALL_SLOT_OFFSETS = [-4, 0, 4];
const WALL_SLOT_INSET = 1.3;
// Holgura entre una vitrina y el borde de un vano
const DOOR_CLEARANCE = 0.9;

/** Muros de una sala con su dirección hacia el interior. */
const roomWalls = ({ minX, maxX, minZ, maxZ }) => [
  { axis: 'z', at: minZ, from: minX, to: maxX, inward: 1 },
  { axis: 'x', at: maxX, from: minZ, to: maxZ, inward: -1 },
  { axis: 'x', at: minX, from: minZ, to: maxZ, inward: 1 },
  { axis: 'z', at: maxZ, from: minX, to: maxX, inward: -1 },
];

export const MAX_EXHIBITS_PER_ROOM = 9;
// Altura de la base de cada vitrina, sobre la que se apoya el artefacto
export const PEDESTAL_HEIGHT = 1;
export const PEDESTAL_WIDTH = 0.6;

/**
 * Posición (x, z) de las vitrinas de una sala, contra sus muros y sin tapar
 * sus vanos, y su rotación en Y para que la pieza (cuyo frente es +z) mire
 * hacia el centro de la sala. Primero el muro frente a la entrada (el que
 * se ve al entrar), luego los demás muros sin puertas y al final los que
 * tienen vanos.
 */
export function getExhibitSlots(room, doors = DOORS) {
  const center = getRoomCenter(room);
  const walls = roomWalls(room.bounds).map((wall) => ({
    ...wall,
    doors: doorsOnWall(wall.axis, wall.at, wall.from, wall.to, doors),
  }));
  const entrance = doors.find((door) => door.entrance === room.id);
  const centerOnAxis = (axis) => (axis === 'x' ? center.x : center.z);
  const isFacingEntrance = (wall) =>
    entrance &&
    wall.axis === entrance.axis &&
    wall.at === 2 * centerOnAxis(wall.axis) - entrance.at;
  const priority = (wall) => (isFacingEntrance(wall) ? -1 : wall.doors.length);
  walls.sort((a, b) => priority(a) - priority(b));

  return walls.flatMap(({ axis, at, from, to, inward, doors: openings }) => {
    const middle = (from + to) / 2;
    return WALL_SLOT_OFFSETS.filter((offset) =>
      openings.every(
        (door) =>
          Math.abs(offset - door.offset) >
          door.width / 2 + DOOR_CLEARANCE + PEDESTAL_WIDTH / 2
      )
    ).map((offset) => {
      const along = middle + offset;
      const across = at + inward * WALL_SLOT_INSET;
      const x = axis === 'x' ? across : along;
      const z = axis === 'x' ? along : across;
      return { x, z, rotationY: Math.atan2(center.x - x, center.z - z) };
    });
  });
}

// Spot de cada vitrina: cerca del techo y en diagonal (adelante a la
// derecha) para que la sombra del artefacto caiga sobre su base y se vea
// desde el frente
const SPOT_HEIGHT = 3.7;
const SPOT_OFFSET = 0.9;

/**
 * Posición del spot de una vitrina y del punto al que apunta (el centro del
 * artefacto, a `targetHeight`), en coordenadas del museo.
 */
export function getSpotPlacement(slot, targetHeight) {
  const cos = Math.cos(slot.rotationY);
  const sin = Math.sin(slot.rotationY);
  return {
    position: [
      slot.x + SPOT_OFFSET * (cos + sin),
      SPOT_HEIGHT,
      slot.z + SPOT_OFFSET * (cos - sin),
    ],
    target: [slot.x, targetHeight, slot.z],
  };
}

const PATIO = COMMON_AREAS.find((area) => area.openSky);
export const PATIO_CENTER = getRoomCenter(PATIO);
export const FOUNTAIN_RADIUS = 1.5;
// Columnas por lado del patio entre las esquinas (los vanos quedan entre
// las dos centrales)
const COLUMN_SPACING = 2.8;

/**
 * Columnas de la galería del patio: una en cada esquina y dos en cada lado,
 * dejando libre el frente de las puertas.
 */
export function getColumnPositions(patio = PATIO) {
  const center = getRoomCenter(patio);
  const half = (patio.bounds.maxX - patio.bounds.minX) / 2 - GALLERY_DEPTH;
  const along = [-half, -COLUMN_SPACING / 2, COLUMN_SPACING / 2, half];
  const positions = new Map();
  along.forEach((t) => {
    [
      [t, -half],
      [t, half],
      [-half, t],
      [half, t],
    ].forEach(([dx, dz]) =>
      positions.set(`${dx},${dz}`, { x: center.x + dx, z: center.z + dz })
    );
  });
  return [...positions.values()];
}
