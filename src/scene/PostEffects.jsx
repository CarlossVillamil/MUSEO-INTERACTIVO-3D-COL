import { EffectComposer, N8AO, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

/**
 * Posprocesado de la escena: oclusión ambiental (sombras de contacto en
 * esquinas, juntas y bases, que dan peso a la arquitectura) y el mapeo de
 * tonos neutro, que respeta los colores de los muros y de la tumbaga.
 */
export default function PostEffects() {
  return (
    <EffectComposer multisampling={4}>
      <N8AO
        halfRes
        aoRadius={1.1}
        distanceFalloff={0.8}
        intensity={2.2}
        quality="medium"
      />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  );
}
