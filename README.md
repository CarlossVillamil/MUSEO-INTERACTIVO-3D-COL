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

| Acción             | Control              |
| ------------------ | -------------------- |
| Capturar el cursor | Clic sobre la escena |
| Moverse            | `W` `A` `S` `D`      |
| Mirar alrededor    | Mouse                |
| Pausar / liberar   | `Esc`                |

## Arquitectura

```
src/
├── data/              # Catálogos puros (salas y fichas de artefactos)
├── store/             # Estado global con Zustand + selectores
├── scene/             # Canvas, visitante (Player), movimiento y proximidad
├── lib/               # Configuración transversal (filtro de consola de three.js)
├── rooms/             # Una carpeta por sala + registro (rooms/index.js)
│   └── SalaPrecolombina/
└── components/
    ├── three/         # Componentes 3D (RoomShell, Exhibit = Pedestal + Artifact + ExhibitLight)
    └── ui/            # Interfaz 2D (Interface, ArtifactCard, PauseMenu)
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
| `currentRoomId`      | —                                        |
| `selectedArtifactId` | `selectArtifact(id)`, `clearSelection()` |
| `isPaused`           | `pause()`, `resume()`                    |

Reglas:

- `components/ui` nunca importa de `scene`, `rooms` ni `components/three` (y viceversa).
- Los datos de `data/` no dependen de React ni de Three.js.

### Iluminación de vitrinas

Cada vitrina (`Exhibit`) tiene un spotlight propio que proyecta la sombra del artefacto sobre su base. Su intensidad sube de forma gradual cuando el visitante está a menos de 3 m (`scene/proximity.js`).

### Advertencias de dependencias

`src/lib/threeConsole.js` filtra, mediante la API oficial `setConsoleFunction` de three.js, solo las advertencias causadas por dependencias que no podemos corregir:

- `THREE.Clock` deprecado: lo crea internamente `@react-three/fiber` 9.x. Eliminar el filtro al actualizar a la v10.

### Agregar una sala

1. Registrar la sala en `src/data/rooms.js` y sus artefactos en `src/data/artifacts.js`.
2. Crear `src/rooms/NombreSala/NombreSala.jsx`.
3. Registrar el componente en `src/rooms/index.js`.
