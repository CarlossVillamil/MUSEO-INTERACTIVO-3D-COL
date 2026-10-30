import { MathUtils } from 'three';

export const PROXIMITY_RADIUS = 3; // metros

/** Distancia en el plano del piso (XZ); la altura de la cámara no cuenta. */
export const getHorizontalDistance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/** Intensidad objetivo de la luz de una vitrina según la cercanía del visitante. */
export const getTargetIntensity = (distance, { near, far }) =>
  distance < PROXIMITY_RADIUS ? near : far;

/**
 * Acerca la intensidad actual a la objetivo de forma gradual e independiente
 * de los FPS (amortiguación exponencial).
 */
export const dampIntensity = (current, target, delta, smoothing = 3) =>
  MathUtils.damp(current, target, smoothing, delta);
