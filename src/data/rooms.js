/**
 * Catálogo y distribución del museo.
 * Datos puros (sin dependencias de React ni Three.js) para que tanto
 * la escena 3D como la interfaz 2D puedan consumirlos.
 *
 * El museo es un claustro: las salas rodean un patio abierto con una fuente,
 * como las casas coloniales donde funcionan muchos museos colombianos. El
 * recorrido es cronológico y gira alrededor del patio:
 *
 *   ┌──────────────┬──────────────┐
 *   │ 2 Colonia    │ 3 Independ.  │
 *   ├──────────────┼──────────────┼──────────────┐
 *   │ 1 Precolomb. │    Patio     │ 4 República  │
 *   └──────────────┼──────────────┼──────────────┘
 *                  │  Vestíbulo   │
 *                  └──────────────┘
 *
 * Coordenadas en metros sobre el plano del piso (x, z); el norte es z
 * negativo. El visitante entra por el vestíbulo, al sur.
 */

/** Espacios de circulación (no son salas de exhibición). */
export const COMMON_AREAS = [
  {
    id: 'vestibulo',
    name: 'Vestíbulo',
    bounds: { minX: -6, maxX: 6, minZ: 0, maxZ: 8 },
  },
  {
    id: 'patio',
    name: 'Patio',
    bounds: { minX: -6, maxX: 6, minZ: -12, maxZ: 0 },
    openSky: true,
  },
];

/** Punto de inicio del visitante: en el vestíbulo, mirando al patio. */
export const SPAWN_POINT = { x: 0, z: 2.5 };

/**
 * Salas en el orden del recorrido. `color` es el color de sus muros: cada
 * periodo tiene el suyo, como en la señalética de los museos.
 */
export const ROOMS = [
  {
    id: 'sala-precolombina',
    name: 'Sala Precolombina',
    period: 'Antes de 1499',
    color: '#1c2740',
    bounds: { minX: -18, maxX: -6, minZ: -12, maxZ: 0 },
  },
  {
    id: 'sala-colonia',
    name: 'Sala de la Colonia',
    period: '1550 – 1810',
    color: '#6e2a23',
    bounds: { minX: -18, maxX: -6, minZ: -24, maxZ: -12 },
  },
  {
    id: 'sala-independencia',
    name: 'Sala de la Independencia',
    period: '1810 – 1819',
    color: '#2f4d6b',
    bounds: { minX: -6, maxX: 6, minZ: -24, maxZ: -12 },
  },
  {
    id: 'sala-republica',
    name: 'Sala de la República',
    period: '1819 – presente',
    color: '#3d5a46',
    bounds: { minX: 6, maxX: 18, minZ: -12, maxZ: 0 },
  },
];

/**
 * Vanos entre espacios. Cada uno está sobre un muro (`axis`: 'x' si el muro
 * tiene x constante, 'z' si tiene z constante) en la coordenada `at`, centrado
 * en `center` sobre el muro. `entrance` indica la sala a la que se entra por
 * él siguiendo el recorrido (lleva su letrero del lado de afuera).
 */
export const DOORS = [
  // Arcada del vestíbulo al patio
  { axis: 'z', at: 0, center: 0, width: 8 },
  { axis: 'x', at: -6, center: -6, width: 3, entrance: 'sala-precolombina' },
  { axis: 'z', at: -12, center: -12, width: 3, entrance: 'sala-colonia' },
  { axis: 'x', at: -6, center: -18, width: 3, entrance: 'sala-independencia' },
  { axis: 'z', at: -12, center: 0, width: 3 },
  { axis: 'x', at: 6, center: -6, width: 3, entrance: 'sala-republica' },
];

/** Todos los espacios del museo: circulación y salas. */
export const SPACES = [...COMMON_AREAS, ...ROOMS];

export const getRoomById = (roomId) =>
  ROOMS.find((room) => room.id === roomId) ?? null;

/** Posición de una sala en el recorrido (1 a 4). */
export const getRoomNumber = (roomId) =>
  ROOMS.findIndex((room) => room.id === roomId) + 1;

export const getRoomCenter = ({ bounds }) => ({
  x: (bounds.minX + bounds.maxX) / 2,
  z: (bounds.minZ + bounds.maxZ) / 2,
});

/** Rectángulo que contiene todo el museo. */
export const MUSEUM_BOUNDS = SPACES.map((space) => space.bounds).reduce(
  (acc, b) => ({
    minX: Math.min(acc.minX, b.minX),
    maxX: Math.max(acc.maxX, b.maxX),
    minZ: Math.min(acc.minZ, b.minZ),
    maxZ: Math.max(acc.maxZ, b.maxZ),
  }),
  { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
);

const contains = ({ minX, maxX, minZ, maxZ }, { x, z }) =>
  x > minX && x < maxX && z > minZ && z < maxZ;

/** Espacio (sala o circulación) que contiene un punto del piso, o null. */
export const getSpaceAt = (point) =>
  SPACES.find(({ bounds }) => contains(bounds, point)) ?? null;

/** Sala en la que se encuentra un punto del piso, o null fuera de las salas. */
export const getRoomAt = (point) =>
  ROOMS.find(({ bounds }) => contains(bounds, point))?.id ?? null;
