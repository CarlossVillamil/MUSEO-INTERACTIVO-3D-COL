import { beforeEach, describe, expect, it } from 'vitest';
import {
  useMuseumStore,
  selectCurrentRoom,
  selectSelectedArtifact,
} from './useMuseumStore';
import { SPAWN_POINT } from '../data/rooms';

const initialState = useMuseumStore.getState();

describe('useMuseumStore', () => {
  beforeEach(() => {
    useMuseumStore.setState(initialState, true);
  });

  it('inicia en el pasillo, en el punto de inicio, sin artefacto seleccionado', () => {
    const state = useMuseumStore.getState();
    expect(selectCurrentRoom(state)).toBeNull();
    expect(state.playerPosition).toEqual(SPAWN_POINT);
    expect(selectSelectedArtifact(state)).toBeNull();
  });

  // Escenario: Carga en progreso
  it('expone el porcentaje de carga mientras la escena no está lista', () => {
    const state = useMuseumStore.getState();
    expect(state.isSceneReady).toBe(false);
    expect(state.loadProgress).toBe(0);

    state.setLoadProgress(42);
    expect(useMuseumStore.getState().loadProgress).toBe(42);
  });

  // Escenario: Primer ingreso
  it('al terminar la carga permite entrar al museo', () => {
    const { markSceneReady, enterMuseum } = useMuseumStore.getState();
    expect(useMuseumStore.getState().hasEntered).toBe(false);

    markSceneReady();
    expect(useMuseumStore.getState().isSceneReady).toBe(true);

    enterMuseum();
    expect(useMuseumStore.getState().hasEntered).toBe(true);
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

  // Escenario: Liberar el cursor
  it('pausa al liberar el cursor y reanuda al capturarlo', () => {
    const { pause, resume } = useMuseumStore.getState();
    expect(useMuseumStore.getState().isPaused).toBe(false);

    pause();
    expect(useMuseumStore.getState().isPaused).toBe(true);

    resume();
    expect(useMuseumStore.getState().isPaused).toBe(false);
  });

  // Escenario: Entrar a una sala temática
  it('al entrar a una sala expone su nombre y periodo', () => {
    useMuseumStore.getState().enterRoom('sala-colonia');
    expect(selectCurrentRoom(useMuseumStore.getState())).toMatchObject({
      name: 'Sala de la Colonia',
      period: '1550 – 1810',
    });

    useMuseumStore.getState().enterRoom(null);
    expect(selectCurrentRoom(useMuseumStore.getState())).toBeNull();
  });

  // Escenario: Consultar el mapa
  it('la tecla M alterna el minimapa con la posición del visitante', () => {
    const { toggleMap, setPlayerPosition } = useMuseumStore.getState();
    expect(useMuseumStore.getState().isMapOpen).toBe(false);

    toggleMap();
    setPlayerPosition(-8, -6);
    expect(useMuseumStore.getState()).toMatchObject({
      isMapOpen: true,
      playerPosition: { x: -8, z: -6 },
    });

    toggleMap();
    expect(useMuseumStore.getState().isMapOpen).toBe(false);
  });

  it('devuelve null para un artefacto inexistente', () => {
    useMuseumStore.getState().selectArtifact('no-existe');
    expect(selectSelectedArtifact(useMuseumStore.getState())).toBeNull();
  });
});
