import { create } from 'zustand';
import { getArtifactById } from '../data/artifacts';
import { SPAWN_POINT, getRoomById } from '../data/rooms';

/**
 * Estado global del museo. Es el único canal de comunicación entre la
 * escena 3D (src/scene, src/rooms, src/components/three) y la interfaz 2D
 * (src/components/ui): ninguna de las dos capas importa a la otra.
 */
export const useMuseumStore = create((set) => ({
  // Porcentaje (0–100) de recursos 3D descargados
  loadProgress: 0,
  // La escena terminó de montar todos sus recursos
  isSceneReady: false,
  // El visitante pulsó «Entrar al museo» en la pantalla de bienvenida
  hasEntered: false,
  // Sala en la que está el visitante; null cuando está en el pasillo
  currentRoomId: null,
  // Posición del visitante sobre el piso (para el minimapa)
  playerPosition: SPAWN_POINT,
  selectedArtifactId: null,
  // Artefacto bajo la mira del visitante (se resalta)
  aimedArtifactId: null,
  // La pieza seleccionada se muestra aislada para rotarla y acercarla
  isInspecting: false,
  // Cambia cada vez que el visitante pide restablecer la vista de inspección
  inspectionResetCount: 0,
  isPaused: false,
  isMapOpen: false,

  setLoadProgress: (progress) => set({ loadProgress: progress }),
  markSceneReady: () => set({ isSceneReady: true }),
  enterMuseum: () => set({ hasEntered: true }),
  enterRoom: (roomId) => set({ currentRoomId: roomId }),
  setPlayerPosition: (x, z) => set({ playerPosition: { x, z } }),
  selectArtifact: (artifactId) => set({ selectedArtifactId: artifactId }),
  aimArtifact: (artifactId) => set({ aimedArtifactId: artifactId }),
  // Solo deja de apuntar si la mira salió del mismo artefacto: al pasar de
  // una pieza a otra, la salida de la anterior puede llegar después
  clearAim: (artifactId) =>
    set((state) =>
      state.aimedArtifactId === artifactId ? { aimedArtifactId: null } : {}
    ),
  clearSelection: () => set({ selectedArtifactId: null, isInspecting: false }),
  startInspection: () =>
    set((state) => ({ isInspecting: state.selectedArtifactId !== null })),
  stopInspection: () => set({ isInspecting: false }),
  resetInspectionView: () =>
    set((state) => ({ inspectionResetCount: state.inspectionResetCount + 1 })),
  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  toggleMap: () => set((state) => ({ isMapOpen: !state.isMapOpen })),
}));

export const selectCurrentRoom = (state) => getRoomById(state.currentRoomId);
/** El visitante recorre el museo con el cursor capturado (sin pausa ni ficha). */
export const selectIsNavigating = (state) =>
  state.hasEntered && !state.isPaused && !state.selectedArtifactId;

export const selectSelectedArtifact = (state) =>
  getArtifactById(state.selectedArtifactId);
