import { setConsoleFunction } from 'three';

/**
 * Advertencias de three.js provocadas por dependencias, no por nuestro código.
 *
 * - THREE.Clock: @react-three/fiber 9.x crea un `new THREE.Clock()` interno,
 *   deprecado desde three r183. Se corrige en @react-three/fiber v10
 *   (usa THREE.Timer); al actualizar, eliminar esta entrada.
 */
export const IGNORED_WARNINGS = [
  'THREE.Clock: This module has been deprecated',
];

export function threeConsole(type, message, ...params) {
  if (
    type === 'warn' &&
    IGNORED_WARNINGS.some((ignored) => message.startsWith(ignored))
  ) {
    return;
  }
  console[type](message, ...params);
}

setConsoleFunction(threeConsole);
