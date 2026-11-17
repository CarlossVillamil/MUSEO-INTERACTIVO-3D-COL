import { useMemo } from 'react';
import { ExtrudeGeometry, Shape } from 'three';
import { COMMON_AREAS, ROOMS, getRoomCenter } from '../../data/rooms';
import {
  FOUNTAIN_RADIUS,
  GALLERY_DEPTH,
  GALLERY_HEIGHT,
  PATIO_CENTER,
  WALL_HEIGHT,
  getColumnPositions,
  getWallSegments,
} from '../../scene/layout';
import { PALETTE, getWallColor, mixColors } from '../../scene/palette';
import { getSurfaceTexture } from '../../scene/textures';

const FACE_THICKNESS = 0.1;
const ZOCALO_HEIGHT = 0.9;
const ZOCALO_RELIEF = 0.015;

/** Centro y tamaño de un tramo de muro desplazado hacia uno de sus lados. */
function faceBox({ axis, at, from, to, bottom }, side, offset, height) {
  const length = to - from;
  const middle = (from + to) / 2;
  const across = at + side * offset;
  const y = bottom + height / 2;
  return axis === 'x'
    ? { position: [across, y, middle], args: [FACE_THICKNESS, height, length] }
    : { position: [middle, y, across], args: [length, height, FACE_THICKNESS] };
}

/**
 * Tramo de muro: cada cara se pinta con el color del espacio al que mira,
 * y la de los espacios encalados lleva zócalo. El exterior no se ve.
 */
function WallSegment({ segment }) {
  return segment.sides.map((spaceId, i) => {
    if (!spaceId) return null;
    const side = i === 0 ? -1 : 1;
    const isRoom = ROOMS.some((room) => room.id === spaceId);
    const height = segment.top - segment.bottom;
    const face = faceBox(segment, side, FACE_THICKNESS / 2, height);
    const hasZocalo = !isRoom && !segment.isLintel;
    // Los muros encalados llevan la textura de la cal; los de las salas, una
    // pintura lisa
    const map = isRoom
      ? null
      : getSurfaceTexture(
          'cal',
          PALETTE.cal,
          segment.to - segment.from,
          height
        );
    const zocalo = faceBox(
      { ...segment, top: ZOCALO_HEIGHT },
      side,
      FACE_THICKNESS / 2 + ZOCALO_RELIEF,
      ZOCALO_HEIGHT
    );

    return (
      <group key={spaceId}>
        <mesh position={face.position} receiveShadow>
          <boxGeometry args={face.args} />
          <meshStandardMaterial
            color={map ? '#ffffff' : getWallColor(spaceId)}
            map={map}
            roughness={0.92}
          />
        </mesh>
        {hasZocalo && (
          <mesh position={zocalo.position} receiveShadow>
            <boxGeometry args={zocalo.args} />
            <meshStandardMaterial color={PALETTE.zocalo} roughness={0.7} />
          </mesh>
        )}
      </group>
    );
  });
}

function Floor({ bounds, kind, color, roughness, y = 0 }) {
  const { x, z } = getRoomCenter({ bounds });
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const map = useMemo(
    () => getSurfaceTexture(kind, color, width, depth),
    [kind, color, width, depth]
  );
  return (
    <mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={map} roughness={roughness} />
    </mesh>
  );
}

function Ceiling({ bounds, color, height = WALL_HEIGHT }) {
  const { x, z } = getRoomCenter({ bounds });
  return (
    <mesh position={[x, height, z]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry
        args={[bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ]}
      />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

const COLUMN_RADIUS = 0.17;
const COLUMN_BASE = 0.3;
const CAPITAL_HEIGHT = 0.18;
const BEAM_HEIGHT = 0.32;

/** Columna toscana de la galería: basa, fuste y capitel. */
function Column({ x, z }) {
  const shaft = GALLERY_HEIGHT - BEAM_HEIGHT - COLUMN_BASE - CAPITAL_HEIGHT;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, COLUMN_BASE / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.46, COLUMN_BASE, 0.46]} />
        <meshStandardMaterial color={PALETTE.zocalo} roughness={0.7} />
      </mesh>
      <mesh position={[0, COLUMN_BASE + shaft / 2, 0]} castShadow>
        <cylinderGeometry
          args={[COLUMN_RADIUS * 0.88, COLUMN_RADIUS, shaft, 24]}
        />
        <meshStandardMaterial color={PALETTE.cal} roughness={0.85} />
      </mesh>
      <mesh
        position={[0, COLUMN_BASE + shaft + CAPITAL_HEIGHT / 2, 0]}
        castShadow
      >
        <boxGeometry args={[0.42, CAPITAL_HEIGHT, 0.42]} />
        <meshStandardMaterial color={PALETTE.cal} roughness={0.85} />
      </mesh>
    </group>
  );
}

/**
 * Galería del claustro: techo de madera entre los muros del patio y la
 * columnata, una viga sobre las columnas y piso de baldosa.
 */
function Gallery({ patio }) {
  const { minX, maxX, minZ, maxZ } = patio.bounds;
  const inner = {
    minX: minX + GALLERY_DEPTH,
    maxX: maxX - GALLERY_DEPTH,
    minZ: minZ + GALLERY_DEPTH,
    maxZ: maxZ - GALLERY_DEPTH,
  };
  const width = maxX - minX;
  const innerWidth = inner.maxX - inner.minX;
  // Cuatro franjas de techo (norte, sur, oeste, este)
  const strips = [
    {
      x: PATIO_CENTER.x,
      z: minZ + GALLERY_DEPTH / 2,
      w: width,
      d: GALLERY_DEPTH,
    },
    {
      x: PATIO_CENTER.x,
      z: maxZ - GALLERY_DEPTH / 2,
      w: width,
      d: GALLERY_DEPTH,
    },
    {
      x: minX + GALLERY_DEPTH / 2,
      z: PATIO_CENTER.z,
      w: GALLERY_DEPTH,
      d: innerWidth,
    },
    {
      x: maxX - GALLERY_DEPTH / 2,
      z: PATIO_CENTER.z,
      w: GALLERY_DEPTH,
      d: innerWidth,
    },
  ];
  const beams = [
    { x: PATIO_CENTER.x, z: inner.minZ, w: innerWidth + 0.4, d: 0.36 },
    { x: PATIO_CENTER.x, z: inner.maxZ, w: innerWidth + 0.4, d: 0.36 },
    { x: inner.minX, z: PATIO_CENTER.z, w: 0.36, d: innerWidth },
    { x: inner.maxX, z: PATIO_CENTER.z, w: 0.36, d: innerWidth },
  ];

  return (
    <group>
      <Floor
        bounds={patio.bounds}
        kind="baldosa"
        color={PALETTE.baldosa}
        roughness={0.8}
      />
      <Floor
        bounds={inner}
        kind="piedra"
        color={PALETTE.piedra}
        roughness={0.95}
        y={0.002}
      />
      {strips.map((s, i) => (
        <mesh key={i} position={[s.x, GALLERY_HEIGHT + 0.06, s.z]}>
          <boxGeometry args={[s.w, 0.12, s.d]} />
          <meshStandardMaterial color={PALETTE.maderaTecho} roughness={0.9} />
        </mesh>
      ))}
      {beams.map((b, i) => (
        <mesh
          key={i}
          position={[b.x, GALLERY_HEIGHT - BEAM_HEIGHT / 2, b.z]}
          castShadow
        >
          <boxGeometry args={[b.w, BEAM_HEIGHT, b.d]} />
          <meshStandardMaterial color={PALETTE.cal} roughness={0.85} />
        </mesh>
      ))}
      {getColumnPositions(patio).map((p) => (
        <Column key={`${p.x},${p.z}`} {...p} />
      ))}
    </group>
  );
}

const BASIN_HEIGHT = 0.5;
const RIM_WIDTH = 0.16;

/** Octágono (con el lado plano al frente) como contorno para extruir. */
function octagon(radius) {
  const shape = new Shape();
  for (let i = 0; i < 8; i++) {
    const angle = Math.PI / 8 + (i * Math.PI) / 4;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

/**
 * Pila de piedra en el centro del patio: brocal octogonal hueco con el agua
 * adentro y una columna con taza en el centro.
 */
function Fountain() {
  const stone = mixColors(PALETTE.piedra, PALETTE.cal, 0.35);
  const basin = useMemo(() => {
    const rim = octagon(FOUNTAIN_RADIUS);
    rim.holes.push(octagon(FOUNTAIN_RADIUS - RIM_WIDTH));
    return new ExtrudeGeometry(rim, {
      depth: BASIN_HEIGHT,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      bevelSegments: 2,
    });
  }, []);

  return (
    <group position={[PATIO_CENTER.x, 0, PATIO_CENTER.z]}>
      <mesh
        geometry={basin}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={stone} roughness={0.9} />
      </mesh>
      <mesh
        position={[0, BASIN_HEIGHT - 0.12, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 8]}
      >
        <circleGeometry args={[FOUNTAIN_RADIUS - RIM_WIDTH + 0.01, 8]} />
        <meshStandardMaterial
          color={PALETTE.agua}
          roughness={0.04}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.15, 1.1, 24]} />
        <meshStandardMaterial color={stone} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow>
        <cylinderGeometry args={[0.46, 0.12, 0.16, 32]} />
        <meshStandardMaterial color={stone} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.09, 24, 16]} />
        <meshStandardMaterial color={stone} roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Recinto del museo (claustro): pisos, techos y muros de cada espacio según
 * `data/rooms.js`, la galería con columnas alrededor del patio y la fuente.
 */
export default function MuseumShell() {
  const segments = useMemo(() => getWallSegments(), []);
  const patio = COMMON_AREAS.find((area) => area.openSky);

  return (
    <group name="museum-shell">
      {ROOMS.map((room) => (
        <group key={room.id}>
          <Floor
            bounds={room.bounds}
            kind="concreto"
            color={PALETTE.concreto}
            roughness={0.5}
          />
          <Ceiling
            bounds={room.bounds}
            color={mixColors(room.color, '#000000', 0.45)}
          />
        </group>
      ))}
      {COMMON_AREAS.filter((area) => !area.openSky).map((area) => (
        <group key={area.id}>
          <Floor
            bounds={area.bounds}
            kind="piedra"
            color={PALETTE.piedra}
            roughness={0.95}
          />
          <Ceiling bounds={area.bounds} color={PALETTE.maderaTecho} />
        </group>
      ))}
      <Gallery patio={patio} />
      <Fountain />
      {segments.map((segment, i) => (
        <WallSegment key={i} segment={segment} />
      ))}
    </group>
  );
}
