import { Vector3 } from 'three';

const UP = new Vector3(0, 1, 0);
const forward = new Vector3();
const right = new Vector3();

/**
 * Calcula la dirección de desplazamiento en el plano XZ según las teclas
 * presionadas y hacia dónde mira la cámara (se ignora la inclinación vertical).
 * Devuelve un vector normalizado, o (0, 0, 0) si no hay teclas presionadas.
 */
export function getMoveDirection(keys, camera, target = new Vector3()) {
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  right.crossVectors(forward, UP).normalize();

  target.set(0, 0, 0);
  if (keys.forward) target.add(forward);
  if (keys.backward) target.sub(forward);
  if (keys.right) target.add(right);
  if (keys.left) target.sub(right);

  return target.lengthSq() > 0 ? target.normalize() : target;
}
