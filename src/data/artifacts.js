/**
 * Catálogo de artefactos (fichas). Datos de ejemplo para validar la
 * comunicación 2D-3D; el contenido real se agregará en historias posteriores.
 */
export const ARTIFACTS = [
  {
    id: 'artefacto-1',
    roomId: 'sala-precolombina',
    name: 'Artefacto de ejemplo 1',
    description: 'Ficha de ejemplo del primer artefacto.',
    position: [-1.5, 0.5, 0],
  },
  {
    id: 'artefacto-2',
    roomId: 'sala-precolombina',
    name: 'Artefacto de ejemplo 2',
    description: 'Ficha de ejemplo del segundo artefacto.',
    position: [1.5, 0.5, 0],
  },
];

export const getArtifactById = (artifactId) =>
  ARTIFACTS.find((artifact) => artifact.id === artifactId) ?? null;

export const getArtifactsByRoom = (roomId) =>
  ARTIFACTS.filter((artifact) => artifact.roomId === roomId);
