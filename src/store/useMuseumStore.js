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
  isPaused: false,
  isMapOpen: false,

  setLoadProgress: (progress) => set({ loadProgress: progress }),
  markSceneReady: () => set({ isSceneReady: true }),
  enterMuseum: () => set({ hasEntered: true }),
  enterRoom: (roomId) => set({ currentRoomId: roomId }),
  setPlayerPosition: (x, z) => set({ playerPosition: { x, z } }),
  selectArtifact: (artifactId) => set({ selectedArtifactId: artifactId }),
  clearSelection: () => set({ selectedArtifactId: null }),
  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  toggleMap: () => set((state) => ({ isMapOpen: !state.isMapOpen })),
}));

export const selectCurrentRoom = (state) => getRoomById(state.currentRoomId);
export const selectSelectedArtifact = (state) =>
  getArtifactById(state.selectedArtifactId);
