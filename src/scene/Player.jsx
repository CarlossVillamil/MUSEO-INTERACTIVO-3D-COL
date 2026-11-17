import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { getRoomAt } from '../data/rooms';
import { useMuseumStore } from '../store/useMuseumStore';
import { getMoveDirection } from './movement';

const WALK_SPEED = 3; // unidades por segundo
// Margen para que la rotación vertical no llegue a los polos ni invierta la cámara
const PITCH_MARGIN = 0.15;
// Desplazamiento mínimo (m) antes de publicar la posición para el minimapa
const POSITION_EPSILON = 0.05;
// Selector sin coincidencias: desactiva la captura automática de drei con
// cualquier clic; la gestionamos nosotros para respetar la pantalla de inicio
const NO_AUTO_LOCK = '#no-auto-pointer-lock';

const direction = new Vector3();

/**
 * Captura el cursor. Si el navegador lo rechaza (p. ej. sin un gesto del
 * visitante) se queda en pausa y el siguiente clic lo vuelve a intentar.
 */
function requestLock(controls) {
  if (!controls || controls.isLocked) return;
  controls.domElement.requestPointerLock()?.catch?.(() => {});
}

/** Publica en el store la sala actual y la posición del visitante. */
function syncPlayerState({ x, z }) {
  const { currentRoomId, playerPosition, enterRoom, setPlayerPosition } =
    useMuseumStore.getState();

  const roomId = getRoomAt({ x, z });
  if (roomId !== currentRoomId) enterRoom(roomId);

  const moved = Math.hypot(x - playerPosition.x, z - playerPosition.z);
  if (moved > POSITION_EPSILON) setPlayerPosition(x, z);
}

/**
 * Visitante en primera persona: tras entrar al museo, un clic captura el
 * cursor, el mouse rota la vista y W/A/S/D desplazan la cámara.
 * Al liberar el cursor (Esc o al abrir una ficha) avisa al store de la pausa,
 * y en cada cuadro publica en qué sala se encuentra y su posición.
 */
export default function Player() {
  const controlsRef = useRef(null);
  const [, getKeys] = useKeyboardControls();
  const pause = useMuseumStore((s) => s.pause);
  const resume = useMuseumStore((s) => s.resume);

  // El clic en «Entrar al museo» actualiza el store antes de llegar al
  // documento, así que ese mismo clic ya captura el cursor
  // Con la ficha técnica abierta el clic es para la ficha, no para recapturar
  useEffect(() => {
    const handleClick = () => {
      const { hasEntered, selectedArtifactId } = useMuseumStore.getState();
      if (hasEntered && !selectedArtifactId) requestLock(controlsRef.current);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Al abrir una ficha se libera el cursor y la navegación queda en pausa;
  // al cerrarla (Esc o Cerrar) se recaptura y el recorrido sigue desde la
  // misma posición, porque la cámara no se movió mientras tanto
  useEffect(
    () =>
      useMuseumStore.subscribe((state, previous) => {
        if (state.selectedArtifactId && !previous.selectedArtifactId) {
          controlsRef.current?.unlock();
        } else if (!state.selectedArtifactId && previous.selectedArtifactId) {
          requestLock(controlsRef.current);
        }
      }),
    []
  );

  useFrame((state, delta) => {
    if (!controlsRef.current?.isLocked) return;

    getMoveDirection(getKeys(), state.camera, direction);
    state.camera.position.addScaledVector(direction, WALK_SPEED * delta);
    syncPlayerState(state.camera.position);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      selector={NO_AUTO_LOCK}
      minPolarAngle={PITCH_MARGIN}
      maxPolarAngle={Math.PI - PITCH_MARGIN}
      onLock={resume}
      onUnlock={pause}
    />
  );
}
