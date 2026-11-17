import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import InspectedArtifact from '../components/three/InspectedArtifact';
import { getRoomById } from '../data/rooms';
import {
  useMuseumStore,
  selectSelectedArtifact,
} from '../store/useMuseumStore';
import MuseumEnvironment from './MuseumEnvironment';

// Distancias de cámara para una pieza de 1 m (INSPECTION_SIZE en InspectedArtifact): la más
// cercana deja ver los detalles sin atravesar la pieza y la más lejana la
// muestra completa con margen
const INSPECTION_ZOOM = { initial: 1.7, min: 1, max: 3.4 };

/**
 * Cámara orbital alrededor de la pieza: arrastrar la rota y la rueda la
 * acerca o aleja dentro de INSPECTION_ZOOM. Vuelve a la vista inicial cada
 * vez que el visitante lo pide desde la interfaz.
 */
function InspectionControls() {
  const controlsRef = useRef(null);
  const resetCount = useMuseumStore((s) => s.inspectionResetCount);

  useEffect(() => {
    controlsRef.current?.reset();
  }, [resetCount]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableDamping
      minDistance={INSPECTION_ZOOM.min}
      maxDistance={INSPECTION_ZOOM.max}
    />
  );
}

/**
 * Modo de inspección: un lienzo propio, sobre el museo, con la pieza
 * seleccionada aislada en el centro de la pantalla.
 */
export default function InspectionScene() {
  const artifact = useMuseumStore(selectSelectedArtifact);
  const isInspecting = useMuseumStore((s) => s.isInspecting);

  if (!isInspecting || !artifact) return null;

  return (
    <div
      className="inspection-scene"
      style={{ '--room-color': getRoomById(artifact.roomId).color }}
    >
      <Canvas camera={{ position: [0, 0, INSPECTION_ZOOM.initial], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 4]} intensity={1.5} />
        <Suspense fallback={null}>
          <MuseumEnvironment />
          <InspectedArtifact artifact={artifact} />
        </Suspense>
        <InspectionControls />
      </Canvas>
    </div>
  );
}
