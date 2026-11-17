import { useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { useMuseumStore } from '../store/useMuseumStore';

/**
 * Publica en el store el porcentaje de recursos descargados por los loaders
 * de three.js (modelos, texturas…), para la barra de la pantalla de inicio.
 *
 * Los loaders avisan su avance durante el render de los componentes que
 * suspenden (useGLTF), así que la actualización se difiere: suscribirse con
 * un hook dispararía renders de otros componentes en pleno render.
 */
export function LoadingTracker() {
  const setLoadProgress = useMuseumStore((s) => s.setLoadProgress);

  useEffect(
    () =>
      useProgress.subscribe(({ progress }) => {
        queueMicrotask(() => setLoadProgress(progress));
      }),
    [setLoadProgress]
  );

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
