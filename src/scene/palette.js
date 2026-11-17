import { Color } from 'three';
import { getRoomById } from '../data/rooms';

/**
 * Materiales del claustro: muros encalados con zócalo verde, como en las
 * casas coloniales de Boyacá; piso de piedra en el patio, baldosa de barro
 * en la galería y concreto pulido en las salas, cuyos muros llevan el color
 * de su periodo (`color` en data/rooms.js).
 */
export const PALETTE = {
  cal: '#e8e4da',
  zocalo: '#2e5a4c',
  piedra: '#b8ab95',
  baldosa: '#94553a',
  concreto: '#3b3733',
  maderaTecho: '#5b4030',
  agua: '#1f3a42',
  cielo: '#c9d4d8',
};

const scratch = new Color();

/** Mezcla dos colores hex (t = 0 → a, t = 1 → b). */
export const mixColors = (a, b, t) =>
  `#${scratch.set(a).lerp(new Color(b), t).getHexString()}`;

/** Color de los muros de un espacio (las salas, el suyo; la circulación, cal). */
export const getWallColor = (spaceId) =>
  getRoomById(spaceId)?.color ?? PALETTE.cal;
