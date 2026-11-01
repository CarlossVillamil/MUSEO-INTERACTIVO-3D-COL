# Museo Interactivo 3D de Colombia

Museo virtual construido con Vite + React + React Three Fiber, con estado global en Zustand y despliegue continuo en Vercel.

## Scripts

| Comando       | Descripción                  |
| ------------- | ---------------------------- |
| `pnpm dev`    | Servidor de desarrollo       |
| `pnpm build`  | Build de producción          |
| `pnpm lint`   | ESLint                       |
| `pnpm test`   | Pruebas unitarias (Vitest)   |
| `pnpm format` | Formatea `src/` con Prettier |

## Controles

| Acción             | Control                                     |
| ------------------ | ------------------------------------------- |
| Entrar al museo    | Botón «Entrar al museo» (captura el cursor) |
| Capturar el cursor | Clic sobre la escena                        |
| Moverse            | `W` `A` `S` `D`                             |
| Mirar alrededor    | Mouse                                       |
| Pausar / liberar   | `Esc`                                       |
| Mostrar mapa       | `M`                                         |

## Arquitectura

```
src/
├── data/              # Catálogos puros (salas con su distribución y fichas de artefactos)
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

### Iluminación de vitrinas

Cada vitrina (`Exhibit`) tiene un spotlight propio que proyecta la sombra del artefacto sobre su base. Su intensidad sube de forma gradual cuando el visitante está a menos de 3 m (`scene/proximity.js`).

### Advertencias de dependencias

`src/lib/threeConsole.js` filtra, mediante la API oficial `setConsoleFunction` de three.js, solo las advertencias causadas por dependencias que no podemos corregir:

- `THREE.Clock` deprecado: lo crea internamente `@react-three/fiber` 9.x. Eliminar el filtro al actualizar a la v10.

### Agregar una sala

1. Registrar la sala en `src/data/rooms.js` y sus artefactos en `src/data/artifacts.js`.
2. Crear `src/rooms/NombreSala/NombreSala.jsx` usando el contenedor `Room` (aporta la señalética y posiciona las vitrinas relativas al centro de la sala).
3. Registrar el componente en `src/rooms/index.js`.
