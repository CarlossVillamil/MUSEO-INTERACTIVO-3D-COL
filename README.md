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
| `currentRoomId`      | `enterRoom(id)` (null = pasillo)         |
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
- `WelcomeScreen` muestra los controles con una barra de progreso mientras carga y, al terminar, el botón «Entrar al museo». Ese clic también captura el cursor: `Player` gestiona la captura y solo la permite después de entrar.

### Distribución del museo

Un pasillo principal (norte–sur) conecta las cuatro salas temáticas en orden cronológico:

```
        ┌──────────────┬────┬──────────────┐
        │ Independencia│    │  República   │
        │  1810–1819   ▯    ▯ 1819–presente│
        ├──────────────┤    ├──────────────┤
        │ Precolombina │    │   Colonia    │
        │ antes de 1499▯    ▯  1550–1810   │
        └──────────────┤    ├──────────────┘
                       │ ●  │  ● inicio
                       └────┘
```

- La distribución (límites de cada sala, pasillo y lado de la puerta) vive en `data/rooms.js`; los muros, vanos y dinteles se generan con `scene/layout.js`.
- Cada sala tiene su señalética 3D (`RoomSign`) sobre el dintel de la puerta, del lado del pasillo. Usa la fuente local Cinzel (`@fontsource/cinzel`), elegida porque no tiene reglas tipográficas que troika-three-text no soporte (evita mensajes en consola).
- Al cruzar una puerta, `Player` publica la sala en el store y `RoomBanner` muestra su nombre y periodo durante 3 segundos. La tecla `M` abre el minimapa con la posición actual.

### Ficha técnica

- Con el cursor capturado no hay puntero en pantalla: el visitante apunta con la mira del centro (`Crosshair`). `MuseumScene` lanza los rayos de los clics desde el centro de la vista, con un alcance de 4 m, y `Artifact` solo responde si la pieza está en la sala actual (los rayos no se detienen en los muros).
- Al seleccionar una pieza, `Player` libera el cursor: la navegación queda en pausa (sin mostrar el menú de pausa) y `ArtifactCard` muestra nombre, época, cultura y descripción (`period` y `culture` del catálogo).
- `Esc` o «Cerrar» limpian la selección y `Player` vuelve a capturar el cursor: el recorrido sigue desde la misma posición. Si el navegador rechaza la captura, aparece la pausa y un clic la retoma.

### Artefactos en las vitrinas

- El catálogo `src/data/artifacts.js` define cada pieza: sala, ficha, modelo GLB, preset de material, tamaño de exhibición y crédito del modelo. El orden dentro de cada sala define su vitrina (`getExhibitSlots` en `scene/layout.js`: 9 vitrinas por sala, orientadas hacia la entrada).
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

Cada vitrina (`Exhibit`) tiene un spotlight propio que proyecta la sombra del artefacto sobre su base. Su intensidad sube de forma gradual cuando el visitante está a menos de 3 m (`scene/proximity.js`).

### Advertencias de dependencias

`src/lib/threeConsole.js` filtra, mediante la API oficial `setConsoleFunction` de three.js, solo las advertencias causadas por dependencias que no podemos corregir:

- `THREE.Clock` deprecado: lo crea internamente `@react-three/fiber` 9.x. Eliminar el filtro al actualizar a la v10.

### Agregar una sala

1. Registrar la sala en `src/data/rooms.js` y sus artefactos en `src/data/artifacts.js`.
2. Crear `src/rooms/NombreSala/NombreSala.jsx` usando el contenedor `Room` (aporta la señalética y posiciona las vitrinas relativas al centro de la sala).
3. Registrar el componente en `src/rooms/index.js`.
