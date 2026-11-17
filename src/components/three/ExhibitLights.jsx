import { useMemo } from 'react';
import { getArtifactsByRoom } from '../../data/artifacts';
import { getRoomById } from '../../data/rooms';
import {
  MAX_EXHIBITS_PER_ROOM,
  PEDESTAL_HEIGHT,
  getExhibitSlots,
  getSpotPlacement,
} from '../../scene/layout';
import { useMuseumStore } from '../../store/useMuseumStore';
import ExhibitLight from './ExhibitLight';

/** Ubicación de los spots sobre las vitrinas de una sala (vacía en el pasillo). */
function getRoomSpotPlacements(roomId) {
  const room = getRoomById(roomId);
  if (!room) return [];
  const slots = getExhibitSlots(room);
  return getArtifactsByRoom(roomId).map((artifact, i) =>
    getSpotPlacement(slots[i], PEDESTAL_HEIGHT + artifact.size / 2)
  );
}

/**
 * Iluminación de las vitrinas de la sala donde está el visitante.
 *
 * Siempre hay montados los mismos spots (uno por vitrina posible) y se
 * reubican al cambiar de sala: si la cantidad de luces cambiara, three.js
 * recompilaría los shaders de todos los materiales y la escena se
 * congelaría un momento al cruzar cada puerta. Solo se iluminan las vitrinas
 * de la sala actual para no superar el límite de sombras de la GPU.
 */
export default function ExhibitLights() {
  const currentRoomId = useMuseumStore((s) => s.currentRoomId);
  const placements = useMemo(
    () => getRoomSpotPlacements(currentRoomId),
    [currentRoomId]
  );

  return Array.from({ length: MAX_EXHIBITS_PER_ROOM }, (_, i) => (
    <ExhibitLight key={i} placement={placements[i]} />
  ));
}
