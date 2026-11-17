import { describe, expect, it } from 'vitest';
import { ROOMS, CORRIDOR } from '../data/rooms';
import {
  DOOR_HEIGHT,
  DOOR_WIDTH,
  WALL_HEIGHT,
  getDoor,
  getExhibitSlots,
  getWallSegments,
} from './layout';

const segments = getWallSegments();

/** Tramos que cubren el punto (x, z) del piso a la altura indicada. */
const segmentsAt = (x, z, height) =>
  segments.filter(({ from, to, bottom, top }) => {
    const minX = Math.min(from[0], to[0]);
    const maxX = Math.max(from[0], to[0]);
    const minZ = Math.min(from[1], to[1]);
    const maxZ = Math.max(from[1], to[1]);
    return (
      x >= minX &&
      x <= maxX &&
      z >= minZ &&
      z <= maxZ &&
      height >= bottom &&
      height <= top
    );
  });

describe('getDoor', () => {
  it('ubica la puerta en el muro que da al pasillo, mirando hacia él', () => {
    const precolombina = ROOMS.find((r) => r.id === 'sala-precolombina');
    expect(getDoor(precolombina)).toEqual({ x: -2, z: -6, facing: 1 });

    const colonia = ROOMS.find((r) => r.id === 'sala-colonia');
    expect(getDoor(colonia)).toEqual({ x: 2, z: -6, facing: -1 });
  });
});

describe('getWallSegments', () => {
  it('deja un vano transitable en la puerta de cada sala', () => {
    ROOMS.forEach((room) => {
      const door = getDoor(room);
      expect(segmentsAt(door.x, door.z, 1)).toHaveLength(0);
    });
  });

  it('coloca un dintel sobre cada puerta', () => {
    ROOMS.forEach((room) => {
      const door = getDoor(room);
      const [lintel] = segmentsAt(door.x, door.z, WALL_HEIGHT - 0.1);
      expect(lintel.bottom).toBe(DOOR_HEIGHT);
      expect(Math.abs(lintel.to[1] - lintel.from[1])).toBe(DOOR_WIDTH);
    });
  });

  it('las salas están cerradas fuera de la puerta', () => {
    // Muro trasero de la Sala Precolombina
    expect(segmentsAt(-14, -6, 1)).toHaveLength(1);
    // Muro de la sala hacia el pasillo, lejos de la puerta
    expect(segmentsAt(-2, -1, 1)).toHaveLength(1);
  });

  it('cierra los extremos del pasillo', () => {
    expect(segmentsAt(0, CORRIDOR.maxZ, 1)).toHaveLength(1);
    expect(segmentsAt(0, CORRIDOR.minZ, 1)).toHaveLength(1);
    expect(segmentsAt(CORRIDOR.minX, 2, 1)).toHaveLength(1);
    expect(segmentsAt(CORRIDOR.maxX, 2, 1)).toHaveLength(1);
  });

  it('no duplica los muros compartidos entre salas', () => {
    // Muro entre Precolombina e Independencia (z = -12)
    expect(segmentsAt(-8, -12, 1)).toHaveLength(1);
  });
});

describe('getExhibitSlots', () => {
  const PEDESTAL_HALF_WIDTH = 0.35;

  it('ubica todas las vitrinas dentro de su sala, sin tocar los muros', () => {
    ROOMS.forEach((room) => {
      const { minX, maxX, minZ, maxZ } = room.bounds;
      getExhibitSlots(room).forEach(({ x, z }) => {
        expect(x).toBeGreaterThan(minX + PEDESTAL_HALF_WIDTH);
        expect(x).toBeLessThan(maxX - PEDESTAL_HALF_WIDTH);
        expect(z).toBeGreaterThan(minZ + PEDESTAL_HALF_WIDTH);
        expect(z).toBeLessThan(maxZ - PEDESTAL_HALF_WIDTH);
      });
    });
  });

  it('deja libre el paso frente a la puerta', () => {
    ROOMS.forEach((room) => {
      const door = getDoor(room);
      getExhibitSlots(room).forEach(({ x, z }) => {
        const inDoorway = Math.abs(z - door.z) < DOOR_WIDTH / 2;
        if (inDoorway) expect(Math.abs(x - door.x)).toBeGreaterThan(5);
      });
    });
  });

  it('cada pieza mira hacia la entrada de la sala', () => {
    const room = ROOMS.find((r) => r.id === 'sala-precolombina');
    const door = getDoor(room);
    getExhibitSlots(room).forEach(({ x, z, rotationY }) => {
      const facing = { x: Math.sin(rotationY), z: Math.cos(rotationY) };
      const toDoor = { x: door.x - x, z: door.z - z };
      expect(facing.x * toDoor.x + facing.z * toDoor.z).toBeGreaterThan(0);
    });
  });
});
