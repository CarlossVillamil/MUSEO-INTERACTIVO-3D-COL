/**
 * Recinto básico de una sala: piso, techo y cuatro muros orientados hacia
 * el interior. Reutilizable por todas las salas.
 */
export default function RoomShell({
  width = 16,
  depth = 16,
  height = 4,
  floorColor = '#5a4a3f',
  wallColor = '#d9d2c5',
  ceilingColor = '#bfb8ac',
}) {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const midHeight = height / 2;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={ceilingColor} />
      </mesh>

      <mesh position={[0, midHeight, -halfDepth]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[0, midHeight, halfDepth]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh
        position={[-halfWidth, midHeight, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh
        position={[halfWidth, midHeight, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
    </group>
  );
}
