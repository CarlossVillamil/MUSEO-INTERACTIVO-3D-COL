/** Base de la vitrina sobre la que se apoya el artefacto. */
export default function Pedestal({ height, width }) {
  return (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, height, width]} />
      <meshStandardMaterial color="#bdb5a6" roughness={0.8} />
    </mesh>
  );
}
