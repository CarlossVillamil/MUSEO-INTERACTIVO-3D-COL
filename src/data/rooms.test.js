import { describe, expect, it } from 'vitest';
import {
  COMMON_AREAS,
  DOORS,
  MUSEUM_BOUNDS,
  ROOMS,
  SPACES,
  SPAWN_POINT,
  getRoomAt,
  getRoomCenter,
  getRoomNumber,
  getSpaceAt,
} from './rooms';

const overlaps = (a, b) =>
  a.minX < b.maxX && b.minX < a.maxX && a.minZ < b.maxZ && b.minZ < a.maxZ;

/** Espacios a ambos lados del centro de un vano. */
const spacesAround = ({ axis, at, center }) => {
  const point = (offset) =>
    axis === 'x'
      ? { x: at + offset, z: center }
      : { x: center, z: at + offset };
  return [getSpaceAt(point(-0.1))?.id, getSpaceAt(point(0.1))?.id];
};

describe('distribución del museo', () => {
  it('tiene las 4 salas temáticas, en orden cronológico, con nombre, periodo y color', () => {
    expect(ROOMS.map((room) => room.id)).toEqual([
      'sala-precolombina',
      'sala-colonia',
      'sala-independencia',
      'sala-republica',
    ]);
    ROOMS.forEach((room) => {
      expect(room.name).toBeTruthy();
      expect(room.period).toBeTruthy();
      expect(room.color).toMatch(/^#[0-9a-f]{6}$/);
    });
    expect(getRoomNumber('sala-colonia')).toBe(2);
  });

  it('ningún espacio se superpone con otro', () => {
    SPACES.forEach((a, i) =>
      SPACES.slice(i + 1).forEach((b) =>
        expect(overlaps(a.bounds, b.bounds), `${a.id} / ${b.id}`).toBe(false)
      )
    );
  });

  it('cada vano comunica dos espacios del museo', () => {
    DOORS.forEach((door) => {
      const [a, b] = spacesAround(door);
      expect(a, JSON.stringify(door)).toBeTruthy();
      expect(b, JSON.stringify(door)).toBeTruthy();
      expect(a).not.toBe(b);
    });
  });

  it('cada sala tiene un vano de entrada desde el espacio anterior del recorrido', () => {
    ROOMS.forEach((room) => {
      const entrances = DOORS.filter((door) => door.entrance === room.id);
      expect(entrances, room.id).toHaveLength(1);
      expect(spacesAround(entrances[0])).toContain(room.id);
    });
  });

  it('el recorrido conecta todos los espacios desde el vestíbulo', () => {
    const reached = new Set(['vestibulo']);
    let grew = true;
    while (grew) {
      grew = false;
      DOORS.forEach((door) => {
        const [a, b] = spacesAround(door);
        if (reached.has(a) !== reached.has(b)) {
          reached.add(a).add(b);
          grew = true;
        }
      });
    }
    expect([...reached].sort()).toEqual(SPACES.map((s) => s.id).sort());
  });

  it('el visitante empieza en el vestíbulo, fuera de las salas', () => {
    expect(getSpaceAt(SPAWN_POINT).id).toBe('vestibulo');
    expect(getRoomAt(SPAWN_POINT)).toBeNull();
  });

  it('detecta la sala que contiene un punto', () => {
    ROOMS.forEach((room) => {
      expect(getRoomAt(getRoomCenter(room))).toBe(room.id);
    });
    const patio = COMMON_AREAS.find((area) => area.id === 'patio');
    expect(getRoomAt(getRoomCenter(patio))).toBeNull();
  });

  it('el umbral de una puerta todavía no es la sala', () => {
    expect(getRoomAt({ x: -6, z: -6 })).toBeNull();
    expect(getRoomAt({ x: -6.1, z: -6 })).toBe('sala-precolombina');
  });

  it('calcula los límites totales del museo', () => {
    expect(MUSEUM_BOUNDS).toEqual({ minX: -18, maxX: 18, minZ: -24, maxZ: 8 });
  });
});
