import { describe, expect, it } from 'vitest';
import {
  CORRIDOR,
  MUSEUM_BOUNDS,
  ROOMS,
  SPAWN_POINT,
  getRoomAt,
  getRoomCenter,
} from './rooms';

describe('distribución del museo', () => {
  it('tiene las 4 salas temáticas con nombre y periodo', () => {
    expect(ROOMS.map((room) => room.id)).toEqual([
      'sala-precolombina',
      'sala-colonia',
      'sala-independencia',
      'sala-republica',
    ]);
    ROOMS.forEach((room) => {
      expect(room.name).toBeTruthy();
      expect(room.period).toBeTruthy();
    });
  });

  it('todas las salas tienen su entrada sobre el pasillo', () => {
    ROOMS.forEach(({ bounds, doorSide }) => {
      const doorX = doorSide === 'east' ? bounds.maxX : bounds.minX;
      expect([CORRIDOR.minX, CORRIDOR.maxX]).toContain(doorX);
    });
  });

  it('el visitante empieza en el pasillo', () => {
    expect(getRoomAt(SPAWN_POINT)).toBeNull();
  });

  it('detecta la sala que contiene un punto', () => {
    ROOMS.forEach((room) => {
      expect(getRoomAt(getRoomCenter(room))).toBe(room.id);
    });
  });

  it('el umbral de la puerta todavía es pasillo', () => {
    expect(getRoomAt({ x: CORRIDOR.minX, z: -6 })).toBeNull();
    expect(getRoomAt({ x: CORRIDOR.minX - 0.1, z: -6 })).toBe(
      'sala-precolombina'
    );
  });

  it('calcula los límites totales del museo', () => {
    expect(MUSEUM_BOUNDS).toEqual({ minX: -14, maxX: 14, minZ: -24, maxZ: 4 });
  });
});
