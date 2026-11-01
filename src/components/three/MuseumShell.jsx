import { useMemo } from 'react';
import { MUSEUM_BOUNDS } from '../../data/rooms';
import { WALL_HEIGHT, getWallSegments } from '../../scene/layout';

const WALL_THICKNESS = 0.2;

function WallSegment({ segment, color }) {
  const { from, to, bottom, top } = segment;
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const height = top - bottom;
  const alongZ = from[0] === to[0];

  return (
    <mesh
      position={[
        (from[0] + to[0]) / 2,
        bottom + height / 2,
        (from[1] + to[1]) / 2,
      ]}
      rotation={[0, alongZ ? Math.PI / 2 : 0, 0]}
      receiveShadow
    >
      <boxGeometry args={[length, height, WALL_THICKNESS]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/**
 * Recinto del museo: piso, techo y muros del pasillo principal y las salas,
 * generados a partir de la distribución de `data/rooms.js`.
 */
export default function MuseumShell({
  floorColor = '#5a4a3f',
  wallColor = '#d9d2c5',
  ceilingColor = '#bfb8ac',
}) {
  const segments = useMemo(() => getWallSegments(), []);
  const { minX, maxX, minZ, maxZ } = MUSEUM_BOUNDS;
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  return (
    <group name="museum-shell">
      <mesh
        position={[centerX, 0, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>
      <mesh
        position={[centerX, WALL_HEIGHT, centerZ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={ceilingColor} />
      </mesh>
      {segments.map((segment, i) => (
        <WallSegment key={i} segment={segment} color={wallColor} />
      ))}
    </group>
  );
}
