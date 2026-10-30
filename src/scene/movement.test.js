import { describe, expect, it } from 'vitest';
import { PerspectiveCamera } from 'three';
import { getMoveDirection } from './movement';

const NO_KEYS = { forward: false, backward: false, left: false, right: false };

function createCamera({ yaw = 0, pitch = 0 } = {}) {
  const camera = new PerspectiveCamera();
  camera.rotation.set(pitch, yaw, 0, 'YXZ');
  camera.updateMatrixWorld();
  return camera;
}

function expectVector(vector, [x, y, z]) {
  expect(vector.x).toBeCloseTo(x);
  expect(vector.y).toBeCloseTo(y);
  expect(vector.z).toBeCloseTo(z);
}

// Escenario: Moverse por la sala con el teclado
describe('getMoveDirection', () => {
  const camera = createCamera();

  it('W avanza hacia donde mira la cámara', () => {
    expectVector(
      getMoveDirection({ ...NO_KEYS, forward: true }, camera),
      [0, 0, -1]
    );
  });

  it('S retrocede', () => {
    expectVector(
      getMoveDirection({ ...NO_KEYS, backward: true }, camera),
      [0, 0, 1]
    );
  });

  it('A se desplaza a la izquierda', () => {
    expectVector(
      getMoveDirection({ ...NO_KEYS, left: true }, camera),
      [-1, 0, 0]
    );
  });

  it('D se desplaza a la derecha', () => {
    expectVector(
      getMoveDirection({ ...NO_KEYS, right: true }, camera),
      [1, 0, 0]
    );
  });

  it('sin teclas no hay desplazamiento', () => {
    expectVector(getMoveDirection(NO_KEYS, camera), [0, 0, 0]);
  });

  it('las diagonales no son más rápidas', () => {
    const direction = getMoveDirection(
      { ...NO_KEYS, forward: true, right: true },
      camera
    );
    expect(direction.length()).toBeCloseTo(1);
  });

  it('respeta la rotación horizontal de la cámara', () => {
    const turnedLeft = createCamera({ yaw: Math.PI / 2 });
    expectVector(
      getMoveDirection({ ...NO_KEYS, forward: true }, turnedLeft),
      [-1, 0, 0]
    );
  });

  it('mirar hacia arriba o abajo no despega al visitante del piso', () => {
    const lookingDown = createCamera({ pitch: -Math.PI / 3 });
    const direction = getMoveDirection(
      { ...NO_KEYS, forward: true },
      lookingDown
    );
    expectVector(direction, [0, 0, -1]);
  });
});
