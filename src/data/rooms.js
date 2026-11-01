/**
 * Catálogo y distribución de las salas del museo.
 * Datos puros (sin dependencias de React ni Three.js) para que tanto
 * la escena 3D como la interfaz 2D puedan consumirlos.
 *
 * Coordenadas en metros sobre el plano del piso (x, z). El visitante entra
 * por el extremo sur del pasillo (z positivo) y avanza hacia z negativo.
 */

/** Pasillo principal que conecta todas las salas. */
export const CORRIDOR = { minX: -2, maxX: 2, minZ: -24, maxZ: 4 };

/** Punto de inicio del visitante, dentro del pasillo. */
export const SPAWN_POINT = { x: 0, z: 2 };

/**
 * `doorSide` indica en qué muro de la sala está la entrada desde el pasillo
 * ('east' = muro con x máxima, 'west' = muro con x mínima).
 */
export const ROOMS = [
  {
    id: 'sala-precolombina',
    name: 'Sala Precolombina',
    period: 'Antes de 1499',
    bounds: { minX: -14, maxX: -2, minZ: -12, maxZ: 0 },
    doorSide: 'east',
  },
  {
    id: 'sala-colonia',
    name: 'Sala de la Colonia',
    period: '1550 – 1810',
    bounds: { minX: 2, maxX: 14, minZ: -12, maxZ: 0 },
    doorSide: 'west',
  },
  {
    id: 'sala-independencia',
    name: 'Sala de la Independencia',
    period: '1810 – 1819',
    bounds: { minX: -14, maxX: -2, minZ: -24, maxZ: -12 },
    doorSide: 'east',
  },
  {
    id: 'sala-republica',
    name: 'Sala de la República',
    period: '1819 – presente',
    bounds: { minX: 2, maxX: 14, minZ: -24, maxZ: -12 },
    doorSide: 'west',
  },
];

export const getRoomById = (roomId) =>
  ROOMS.find((room) => room.id === roomId) ?? null;

export const getRoomCenter = ({ bounds }) => ({
  x: (bounds.minX + bounds.maxX) / 2,
  z: (bounds.minZ + bounds.maxZ) / 2,
});

/** Rectángulo que contiene todo el museo (pasillo y salas). */
export const MUSEUM_BOUNDS = [
  CORRIDOR,
  ...ROOMS.map((room) => room.bounds),
].reduce(
  (acc, b) => ({
    minX: Math.min(acc.minX, b.minX),
    maxX: Math.max(acc.maxX, b.maxX),
    minZ: Math.min(acc.minZ, b.minZ),
    maxZ: Math.max(acc.maxZ, b.maxZ),
  }),
  { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
);

/** Sala en la que se encuentra un punto del piso, o null si está en el pasillo. */
export const getRoomAt = ({ x, z }) =>
  ROOMS.find(
    ({ bounds }) =>
      x > bounds.minX && x < bounds.maxX && z > bounds.minZ && z < bounds.maxZ
  )?.id ?? null;
