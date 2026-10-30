import { describe, expect, it } from 'vitest';
import {
  PROXIMITY_RADIUS,
  dampIntensity,
  getHorizontalDistance,
  getTargetIntensity,
} from './proximity';

const LEVELS = { near: 30, far: 8 };

// Escenario: Luz que responde a la cercanía
describe('proximidad a una vitrina', () => {
  it('mide la distancia sobre el piso, ignorando la altura', () => {
    const visitor = { x: 3, y: 1.6, z: 4 };
    const exhibit = { x: 0, y: 0, z: 0 };
    expect(getHorizontalDistance(visitor, exhibit)).toBeCloseTo(5);
  });

  it('lejos de la vitrina la luz se mantiene tenue', () => {
    expect(getTargetIntensity(PROXIMITY_RADIUS + 1, LEVELS)).toBe(LEVELS.far);
    expect(getTargetIntensity(PROXIMITY_RADIUS, LEVELS)).toBe(LEVELS.far);
  });

  it('a menos de 3 metros la luz apunta a su intensidad máxima', () => {
    expect(getTargetIntensity(PROXIMITY_RADIUS - 0.1, LEVELS)).toBe(
      LEVELS.near
    );
  });

  it('la intensidad aumenta de forma gradual, no de golpe', () => {
    let intensity = LEVELS.far;
    const steps = [];
    for (let frame = 0; frame < 30; frame++) {
      intensity = dampIntensity(intensity, LEVELS.near, 1 / 60);
      steps.push(intensity);
    }

    expect(steps[0]).toBeGreaterThan(LEVELS.far);
    expect(steps[0]).toBeLessThan(LEVELS.near);
    steps.slice(1).forEach((value, i) => {
      expect(value).toBeGreaterThan(steps[i]);
    });
    expect(steps.at(-1)).toBeLessThan(LEVELS.near);
  });

  it('con suficiente tiempo alcanza la intensidad objetivo', () => {
    let intensity = LEVELS.far;
    for (let frame = 0; frame < 600; frame++) {
      intensity = dampIntensity(intensity, LEVELS.near, 1 / 60);
    }
    expect(intensity).toBeCloseTo(LEVELS.near, 1);
  });
});
