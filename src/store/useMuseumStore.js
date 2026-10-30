import { create } from 'zustand';
import { getArtifactById } from '../data/artifacts';
import { DEFAULT_ROOM_ID } from '../data/rooms';

/**
 * Estado global del museo. Es el único canal de comunicación entre la
 * escena 3D (src/scene, src/rooms, src/components/three) y la interfaz 2D
 * (src/components/ui): ninguna de las dos capas importa a la otra.
 */
export const useMuseumStore = create((set) => ({
  currentRoomId: DEFAULT_ROOM_ID,
  selectedArtifactId: null,
  isPaused: false,

  selectArtifact: (artifactId) => set({ selectedArtifactId: artifactId }),
  clearSelection: () => set({ selectedArtifactId: null }),
  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
}));

export const selectSelectedArtifact = (state) =>
  getArtifactById(state.selectedArtifactId);
