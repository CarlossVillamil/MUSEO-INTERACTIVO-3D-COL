# Museo Interactivo 3D de Colombia

Museo virtual construido con Vite + React + React Three Fiber, con estado global en Zustand y despliegue continuo en Vercel.

## Scripts

| Comando                | Descripción                         |
| ---------------------- | ----------------------------------- |
| `pnpm dev`             | Servidor de desarrollo              |
| `pnpm build`           | Build de producción                 |
| `pnpm lint`            | ESLint                              |
| `pnpm test`            | Pruebas unitarias (Vitest)          |
| `pnpm format`          | Formatea `src/` con Prettier        |
| `pnpm optimize:models` | Optimiza los modelos 3D (ver abajo) |

## Pipeline de modelos 3D

Los modelos exportados desde Blender (`.glb`) se guardan en `models/source/`, en una subcarpeta por sala (`pre-colombina/`, `colonial/`, `independencia/`, `republica/`), y se optimizan con:

```bash
pnpm optimize:models
```

El script (`scripts/optimize-models.js`, con [gltf-transform](https://gltf-transform.dev)) escribe en `public/models/`, con la misma estructura de carpetas, por cada modelo:

| Archivo           | Contenido                  |
| ----------------- | -------------------------- |
| `nombre.glb`      | LOD0: geometría completa   |
| `nombre.lod1.glb` | LOD1: ~50% de los vértices |
| `nombre.lod2.glb` | LOD2: ~20% de los vértices |

Pasos aplicados: conversión de materiales _spec/gloss_ a _metal/rough_ (three.js ya no soporta `KHR_materials_pbrSpecularGlossiness`), limpieza (`dedup`, `prune`, `weld`), simplificación con meshoptimizer (LOD1/LOD2), texturas a **WebP** (máx. 2048 px, calidad 85) y geometría comprimida con **Draco**. Informa la reducción de peso de cada archivo y termina con error si alguno supera los 5 MB de la Definición de Hecho.

> Los originales de `models/source/` no se versionan (están en `.gitignore` por su peso); solo se suben los optimizados de `public/models/`, que son los que publica Vercel.

> Los GLB optimizados usan las extensiones `KHR_draco_mesh_compression` y `EXT_texture_webp`. El decodificador Draco se sirve localmente desde `public/draco/` (copiado de `three/examples/jsm/libs/draco/gltf/`; actualizarlo si se actualiza three).

## Controles

| Acción             | Control                                     |
| ------------------ | ------------------------------------------- |
| Entrar al museo    | Botón «Entrar al museo» (captura el cursor) |
| Capturar el cursor | Clic sobre la escena                        |
| Moverse            | `W` `A` `S` `D`                             |
| Mirar alrededor    | Mouse                                       |
| Ver ficha técnica  | Apuntar a una vitrina con la mira y clic    |
| Cerrar ficha       | `Esc` o botón «Cerrar»                      |
| Pausar / liberar   | `Esc`                                       |
| Mostrar mapa       | `M`                                         |

## Arquitectura

```
src/
├── data/              # Catálogos puros (salas, distribución y artefactos con sus modelos y créditos)
├── store/             # Estado global con Zustand + selectores
├── scene/             # Canvas, visitante (Player), carga, movimiento, proximidad y muros (layout)
├── lib/               # Configuración transversal (filtro de consola de three.js)
├── rooms/             # Una carpeta por sala + registro (rooms/index.js)
│   ├── SalaPrecolombina/
│   ├── SalaColonia/
│   ├── SalaIndependencia/
│   └── SalaRepublica/
└── components/
    ├── three/         # Componentes 3D (MuseumShell, Room, RoomSign, Exhibit = Pedestal + Artifact + ExhibitLight)
    └── ui/            # Interfaz 2D (Interface, WelcomeScreen, ArtifactCard, PauseMenu, RoomBanner, Minimap)
```

### Comunicación 2D ↔ 3D

La escena 3D y la interfaz 2D **no se importan entre sí**: ambas se comunican únicamente a través de `store/useMuseumStore.js`.

```
Clic en artefacto (components/three/Artifact)
        │  selectArtifact(id)
        ▼
useMuseumStore  ── selectedArtifactId
        │  selectSelectedArtifact
        ▼
Ficha 2D (components/ui/ArtifactCard)
```

| Estado               | Acciones                                 |
| -------------------- | ---------------------------------------- |
| `loadProgress`       | `setLoadProgress(p)`                     |
| `isSceneReady`       | `markSceneReady()`                       |
| `hasEntered`         | `enterMuseum()`                          |
| `currentRoomId`      | `enterRoom(id)` (null = fuera de salas)  |
| `playerPosition`     | `setPlayerPosition(x, z)`                |
| `isMapOpen`          | `toggleMap()`                            |
| `selectedArtifactId` | `selectArtifact(id)`, `clearSelection()` |
| `isPaused`           | `pause()`, `resume()`                    |

Reglas:

- `components/ui` nunca importa de `scene`, `rooms` ni `components/three` (y viceversa).
- Los datos de `data/` no dependen de React ni de Three.js.

### Pantalla de bienvenida y carga

- La escena se envuelve en `<Suspense>`: `SceneReady` solo se monta cuando todos los recursos (fuente de la señalética, modelos…) terminaron de cargar, y entonces marca `isSceneReady`.
- `LoadingTracker` publica el porcentaje de `useProgress` (loaders de three.js) en `loadProgress`.
- `WelcomeScreen` presenta el museo, el recorrido y los controles con una línea de progreso mientras carga; al terminar, el fondo se abre y deja ver el claustro, y aparece «Entrar al museo». Ese clic también captura el cursor: `Player` gestiona la captura y solo la permite después de entrar.

### Distribución del museo: un claustro

Las salas rodean un patio abierto con una fuente, como las casas coloniales donde funcionan muchos museos colombianos. El recorrido es cronológico y gira alrededor del patio:

```
        ┌──────────────┬──────────────┐
        │ 2 Colonia    ▯ 3 Independ.  │
        ├──────▯───────┼──────▯───────┼──────────────┐
        │ 1 Precolomb. ▯    Patio     ▯ 4 República  │
        └──────────────┼─────    ─────┼──────────────┘
                       │  Vestíbulo ● │  ● inicio
                       └──────────────┘
```

- `data/rooms.js` define los espacios (`COMMON_AREAS`: vestíbulo y patio; `ROOMS`: las salas, cada una con el color de sus muros) y los vanos (`DOORS`). `entrance` marca la puerta por la que se entra a cada sala siguiendo el recorrido.
- `scene/layout.js` genera los muros a partir de los espacios: cada tramo sabe qué espacio tiene a cada lado para pintar cada cara con su color, y los vanos lo cortan dejando un dintel. También ubica las vitrinas contra los muros sin tapar las puertas (primero el muro frente a la entrada) y las 12 columnas de la galería del patio.
- `MuseumShell` construye pisos, techos, muros (cal con zócalo verde en la circulación; color de periodo en las salas), la galería con columnas y la fuente. Las texturas de baldosa, piedra, concreto y cal se dibujan en un canvas al cargar (`scene/textures.js`).
- Cada sala tiene su rótulo (`RoomSign`) pintado sobre el muro, encima de su puerta de entrada y del lado de afuera: número del recorrido, nombre y periodo, en Newsreader (archivo .woff local, compatible con troika-three-text).
- Al cruzar una puerta, `Player` publica la sala en el store y `RoomBanner` muestra su número, nombre y periodo durante unos segundos. La tecla `M` abre el plano con la posición actual.

### Sistema visual

- **Color** (`src/index.css`): índigo profundo para los paneles, cal para el texto y tumbaga (la aleación de oro y cobre de los orfebres) solo para lo que se puede accionar. Cada sala aporta su color (`data/rooms.js`), que se repite en el recorrido de la bienvenida, el plano y el filo de la ficha.
- **Tipografía**: Newsreader (variable, con tamaño óptico) para títulos y textos de lectura; Archivo para botones, controles e indicaciones. Escala de tercera mayor.
- **Escena**: mapeo de tonos neutro y oclusión ambiental (`scene/PostEffects.jsx`, N8AO), cámara de 60° y luz de día sobre el patio (`PatioLight`).
- La interfaz respeta `prefers-reduced-motion`, muestra el foco del teclado y se adapta a pantallas angostas.

### Ficha técnica

- Con el cursor capturado no hay puntero en pantalla: el visitante apunta con la mira del centro (`Crosshair`). `MuseumScene` lanza los rayos de los clics desde el centro de la vista, con un alcance de 4 m, y `Artifact` solo responde si la pieza está en la sala actual (los rayos no se detienen en los muros).
- Al seleccionar una pieza, `Player` libera el cursor: la navegación queda en pausa (sin mostrar el menú de pausa) y `ArtifactCard` muestra nombre, época, cultura y descripción (`period` y `culture` del catálogo).
- `Esc` o «Cerrar» limpian la selección y `Player` vuelve a capturar el cursor: el recorrido sigue desde la misma posición. Si el navegador rechaza la captura, aparece la pausa y un clic la retoma.

### Resaltado de objetos interactivos

- Cada `Artifact` avisa al store cuando la mira entra o sale de él (`aimArtifact` / `clearAim`). Mientras se navega, la pieza apuntada muestra un contorno dorado (`Outlines` de drei en cada malla, 3 px) y la mira se agranda con la indicación «Clic para ver más».
- `Player` reevalúa en cada cuadro qué hay bajo la mira (`events.update()`), para que el resaltado siga al visitante aunque camine sin mover el mouse.
- Paredes, piso y bases no tienen eventos: un clic sobre ellos no hace nada.
- `prepareModel` calcula las normales de los escaneos que no las traen, porque el contorno las necesita.

### Modo de inspección

- Desde la ficha, «Inspeccionar en 3D» activa `isInspecting` en el store. `scene/InspectionScene` abre un lienzo propio sobre el museo con la pieza aislada y centrada (`InspectedArtifact`, normalizada a 1 m).
- `OrbitControls`: arrastrar rota la pieza y la rueda acerca o aleja entre 1 m y 3,4 m (sin desplazamiento lateral). «Restablecer vista» incrementa `inspectionResetCount` y los controles vuelven a la vista inicial.
- «Volver a la ficha» o `Esc` terminan la inspección. Al cerrar la ficha también termina.

### Luces de las vitrinas

- `ExhibitLights` mantiene siempre montados 9 spots (uno por vitrina posible) y los reubica en la sala actual. Si la cantidad de luces cambiara al cruzar una puerta, three.js recompilaría todos los shaders y la escena se congelaría un momento (antes: hasta 433 ms; ahora ningún cuadro pasa de ~17 ms).
- Las sombras se calculan una sola vez cada vez que un spot cambia de vitrina (`shadow.autoUpdate = false`), y `<Preload all />` compila shaders y sube texturas durante la carga.

### Artefactos en las vitrinas

- El catálogo `src/data/artifacts.js` define cada pieza: sala, ficha, modelo GLB, preset de material, tamaño de exhibición y crédito del modelo. El orden dentro de cada sala define su vitrina (`getExhibitSlots` en `scene/layout.js`: contra los muros, orientadas hacia el centro de la sala).
- `Artifact` carga el modelo con `useGLTF`, lo ajusta al tamaño de exhibición y aplica su material (`scene/materials.js`):

| Preset     | Uso                                                |
| ---------- | -------------------------------------------------- |
| `oro`      | Orfebrería: totalmente metálico, reflejos marcados |
| `metal`    | Armas y cascos                                     |
| `ceramica` | Vasijas e instrumentos de barro                    |
| `piedra`   | Bustos y esculturas                                |
| `original` | Respeta el material del modelo                     |

Campos opcionales: `tint` (color uniforme que reemplaza la textura), `rotation` (corrige la orientación del modelo) y `hiddenMeshes` (quita soportes o fotos que traen algunos escaneos).

- Todos los materiales se normalizan a `MeshStandardMaterial`: los _unlit_ no reciben luz y los _physical_ suman mapas que, con las sombras de 9 spots, superan las 16 unidades de textura de la GPU.
- `MuseumEnvironment` genera un mapa de entorno en la escena (paneles de luz, sin HDRI externos) para que los metales tengan qué reflejar.
- Solo se encienden los spots de la sala donde está el visitante (máximo 9 luces con sombra).
- Los créditos de cada modelo (autor, licencia CC y enlace) están en el campo `source` del catálogo.

### Iluminación de vitrinas

Cada vitrina de la sala actual recibe un spotlight (`ExhibitLights`) que proyecta la sombra del artefacto sobre su base. Su intensidad sube de forma gradual cuando el visitante está a menos de 3 m (`scene/proximity.js`).

### Advertencias de dependencias

`src/lib/threeConsole.js` filtra, mediante la API oficial `setConsoleFunction` de three.js, solo las advertencias causadas por dependencias que no podemos corregir:

- `THREE.Clock` deprecado: lo crea internamente `@react-three/fiber` 9.x. Eliminar el filtro al actualizar a la v10.
- Advertencias del compilador de shaders en Windows (`Program Info Log`) sobre shaders de terceros, como el de N8AO. Los errores de compilación no se filtran.

### Agregar una sala

1. Registrar la sala (límites, color y vanos) en `src/data/rooms.js` y sus artefactos en `src/data/artifacts.js`.
2. Crear `src/rooms/NombreSala/NombreSala.jsx` usando el contenedor `Room` (aporta el rótulo y posiciona las vitrinas contra los muros).
3. Registrar el componente en `src/rooms/index.js`.
