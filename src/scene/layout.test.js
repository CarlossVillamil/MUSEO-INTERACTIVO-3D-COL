import { describe, expect, it } from 'vitest';
import { DOORS, ROOMS } from '../data/rooms';
import {
  DOOR_HEIGHT,
  PEDESTAL_WIDTH,
  WALL_HEIGHT,
  getColumnPositions,
  getExhibitSlots,
  getSpotPlacement,
  getWallSegments,
} from './layout';

const segments = getWallSegments();

/** Tramos que cubren el punto (x, z) del piso a la altura indicada. */
const segmentsAt = (x, z, height) =>
  segments.filter(({ axis, at, from, to, bottom, top }) => {
    const [onLine, along] = axis === 'x' ? [x, z] : [z, x];
    return (
      Math.abs(onLine - at) < 1e-6 &&
      along >= from &&
      along <= to &&
      height >= bottom &&
      height <= top
    );
  });

const doorPoint = ({ axis, at, center }) =>
  axis === 'x' ? { x: at, z: center } : { x: center, z: at };

describe('getWallSegments', () => {
  it('deja un vano transitable en cada puerta, con un dintel encima', () => {
    DOORS.forEach((door) => {
      const { x, z } = doorPoint(door);
      expect(segmentsAt(x, z, 1)).toHaveLength(0);
      const [lintel] = segmentsAt(x, z, WALL_HEIGHT - 0.1);
      expect(lintel.bottom).toBe(DOOR_HEIGHT);
      expect(lintel.to - lintel.from).toBeCloseTo(door.width);
    });
  });

  it('las salas están cerradas fuera de sus puertas', () => {
    // Muro oeste (exterior) de la Sala Precolombina
    expect(segmentsAt(-18, -6, 1)).toHaveLength(1);
    // Muro entre Precolombina y el patio, lejos de la puerta
    expect(segmentsAt(-6, -1, 1)).toHaveLength(1);
    // Muro norte de la República (no tiene salida)
    expect(segmentsAt(12, -12, 1)).toHaveLength(1);
  });

  it('no duplica los muros compartidos y conoce el espacio de cada cara', () => {
    const [wall] = segmentsAt(-6, -2, 1);
    expect(segmentsAt(-6, -2, 1)).toHaveLength(1);
    expect(wall.sides).toEqual(['sala-precolombina', 'patio']);
  });

  it('los muros exteriores tienen el exterior en una de sus caras', () => {
    const [wall] = segmentsAt(-18, -6, 1);
    expect(wall.sides).toEqual([null, 'sala-precolombina']);
  });
});

describe('getExhibitSlots', () => {
  it('cada sala tiene vitrinas suficientes para su colección máxima', () => {
    ROOMS.forEach((room) => {
      expect(getExhibitSlots(room).length).toBeGreaterThanOrEqual(9);
    });
  });

  it('ubica todas las vitrinas dentro de su sala, sin tocar los muros', () => {
    ROOMS.forEach((room) => {
      const { minX, maxX, minZ, maxZ } = room.bounds;
      getExhibitSlots(room).forEach(({ x, z }) => {
        expect(x).toBeGreaterThan(minX + PEDESTAL_WIDTH);
        expect(x).toBeLessThan(maxX - PEDESTAL_WIDTH);
        expect(z).toBeGreaterThan(minZ + PEDESTAL_WIDTH);
        expect(z).toBeLessThan(maxZ - PEDESTAL_WIDTH);
      });
    });
  });

  it('deja libre el paso frente a cada puerta', () => {
    ROOMS.forEach((room) => {
      getExhibitSlots(room).forEach((slot) => {
        DOORS.forEach((door) => {
          const { x, z } = doorPoint(door);
          const along = door.axis === 'x' ? slot.z - z : slot.x - x;
          const across = door.axis === 'x' ? slot.x - x : slot.z - z;
          const inFront = Math.abs(across) < 2.5;
          if (inFront) {
            expect(Math.abs(along), `${room.id}`).toBeGreaterThan(
              door.width / 2 + PEDESTAL_WIDTH
            );
          }
        });
      });
    });
  });

  it('las vitrinas no se superponen entre sí', () => {
    ROOMS.forEach((room) => {
      const slots = getExhibitSlots(room);
      slots.forEach((a, i) =>
        slots.slice(i + 1).forEach((b) => {
          expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeGreaterThan(
            PEDESTAL_WIDTH * 1.5
          );
        })
      );
    });
  });

  it('empieza por el muro frente a la entrada, el que se ve al entrar', () => {
    // República: se entra por el oeste (x = 6), el muro de enfrente es x = 18
    const republica = ROOMS.find((room) => room.id === 'sala-republica');
    getExhibitSlots(republica)
      .slice(0, 3)
      .forEach((slot) => expect(slot.x).toBeGreaterThan(16));
  });

  it('cada pieza mira hacia el centro de su sala', () => {
    const room = ROOMS[0];
    const [slot] = getExhibitSlots(room);
    // Frente de la pieza (+z rotado) apunta hacia el centro
    const front = { x: Math.sin(slot.rotationY), z: Math.cos(slot.rotationY) };
    const toCenter = { x: -12 - slot.x, z: -6 - slot.z };
    expect(front.x * toCenter.x + front.z * toCenter.z).toBeGreaterThan(0);
  });
});

describe('getColumnPositions', () => {
  it('rodea el patio con 12 columnas sin tapar sus puertas', () => {
    const columns = getColumnPositions();
    expect(columns).toHaveLength(12);
    // Frente a la puerta de la Sala Precolombina (x = -6, z = -6)
    columns.forEach(({ x, z }) => {
      if (Math.abs(x - -4.2) < 0.01)
        expect(Math.abs(z - -6)).toBeGreaterThan(1);
    });
  });
});

describe('getSpotPlacement', () => {
  it('ubica el spot sobre la vitrina, adelante a la derecha, apuntando al artefacto', () => {
    const { position, target } = getSpotPlacement(
      { x: 2, z: 3, rotationY: 0 },
      1.1
    );
    expect(position[0]).toBeCloseTo(2.9);
    expect(position[1]).toBeGreaterThan(3);
    expect(position[2]).toBeCloseTo(3.9);
    expect(target).toEqual([2, 1.1, 3]);
  });

  it('gira el desplazamiento con la orientación de la vitrina', () => {
    const { position } = getSpotPlacement(
      { x: 0, z: 0, rotationY: Math.PI / 2 },
      1
    );
    // Igual que un objeto hijo del grupo de la vitrina rotado 90°
    expect(position[0]).toBeCloseTo(0.9);
    expect(position[2]).toBeCloseTo(-0.9);
  });
});
