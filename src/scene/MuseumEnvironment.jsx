import { Environment, Lightformer } from '@react-three/drei';

// Muros iluminados alrededor (como los de una sala): una pieza metálica
// refleja lo que tiene enfrente, venga de donde venga la mirada
const SIDE_PANELS = [
  { position: [-5, 2, 0], rotationY: Math.PI / 2 },
  { position: [5, 2, 0], rotationY: -Math.PI / 2 },
  { position: [0, 2, -5], rotationY: 0 },
  { position: [0, 2, 5], rotationY: Math.PI },
];

/**
 * Mapa de entorno generado en la propia escena (sin HDRI externos) para que
 * los materiales metálicos tengan qué reflejar: un panel cenital, como la
 * iluminación del techo, cuatro muros tenues alrededor y el rebote del piso.
 * Intensidad baja para conservar la penumbra y el protagonismo de los spots.
 */
export default function MuseumEnvironment() {
  return (
    <Environment resolution={256} environmentIntensity={0.35}>
      <Lightformer
        intensity={2}
        position={[0, 5, 0]}
        rotation-x={Math.PI / 2}
        scale={[10, 10, 1]}
      />
      {/* Luz que devuelve el piso: evita reflejos negros hacia abajo */}
      <Lightformer
        intensity={0.4}
        position={[0, -3, 0]}
        rotation-x={-Math.PI / 2}
        scale={[10, 10, 1]}
      />
      {SIDE_PANELS.map(({ position, rotationY }) => (
        <Lightformer
          key={position.join(',')}
          intensity={1}
          position={position}
          rotation-y={rotationY}
          scale={[10, 6, 1]}
        />
      ))}
    </Environment>
  );
}
