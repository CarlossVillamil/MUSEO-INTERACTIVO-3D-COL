import { beforeEach, describe, expect, it } from 'vitest';
import { useMuseumStore, selectSelectedArtifact } from './useMuseumStore';
import { DEFAULT_ROOM_ID } from '../data/rooms';

const initialState = useMuseumStore.getState();

describe('useMuseumStore', () => {
  beforeEach(() => {
    useMuseumStore.setState(initialState, true);
  });

  it('inicia en la sala por defecto sin artefacto seleccionado', () => {
    const state = useMuseumStore.getState();
    expect(state.currentRoomId).toBe(DEFAULT_ROOM_ID);
    expect(selectSelectedArtifact(state)).toBeNull();
  });

  // Escenario: Comunicación 2D-3D
  it('al seleccionar un artefacto la ficha correspondiente queda disponible', () => {
    useMuseumStore.getState().selectArtifact('artefacto-2');

    const artifact = selectSelectedArtifact(useMuseumStore.getState());
    expect(artifact).toMatchObject({
      id: 'artefacto-2',
      name: 'Artefacto de ejemplo 2',
    });
  });

  it('limpia la selección', () => {
    const { selectArtifact, clearSelection } = useMuseumStore.getState();
    selectArtifact('artefacto-1');
    clearSelection();

    expect(selectSelectedArtifact(useMuseumStore.getState())).toBeNull();
  });

  it('devuelve null para un artefacto inexistente', () => {
    useMuseumStore.getState().selectArtifact('no-existe');
    expect(selectSelectedArtifact(useMuseumStore.getState())).toBeNull();
  });
});
