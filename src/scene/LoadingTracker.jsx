import { useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { useMuseumStore } from '../store/useMuseumStore';

/**
 * Publica en el store el porcentaje de recursos descargados por los loaders
 * de three.js (modelos, texturas…), para la barra de la pantalla de inicio.
 */
export function LoadingTracker() {
  const progress = useProgress((state) => state.progress);
  const setLoadProgress = useMuseumStore((s) => s.setLoadProgress);

  useEffect(() => {
    setLoadProgress(progress);
  }, [progress, setLoadProgress]);

  return null;
}

/**
 * Se monta dentro del <Suspense> de la escena: solo llega a montarse cuando
 * todo su contenido (fuentes, modelos…) terminó de cargar.
 */
export function SceneReady() {
  const markSceneReady = useMuseumStore((s) => s.markSceneReady);

  useEffect(() => {
    markSceneReady();
  }, [markSceneReady]);

  return null;
}
