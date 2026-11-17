import { describe, expect, it } from 'vitest';
import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Texture,
  Vector3,
} from 'three';
import { fitToSize, prepareModel, toStandardMaterial } from './materials';

const createModel = (material) => {
  const root = new Group();
  root.add(new Mesh(new BoxGeometry(), material));
  return root;
};
const firstMaterial = (root) => root.children[0].material;

// Escenario: Visualizar una pieza de orfebrería
describe('prepareModel', () => {
  it('el preset de oro deja el material totalmente metálico y pulido', () => {
    const root = prepareModel(
      createModel(new MeshStandardMaterial({ metalness: 0, roughness: 1 })),
      { material: 'oro' }
    );
    const material = firstMaterial(root);

    expect(material.metalness).toBe(1);
    expect(material.roughness).toBeLessThan(0.5);
  });

  it('conserva la textura original al aplicar el preset', () => {
    const map = new Texture();
    const root = prepareModel(createModel(new MeshStandardMaterial({ map })), {
      material: 'ceramica',
    });
    expect(firstMaterial(root).map).toBe(map);
    expect(firstMaterial(root).metalness).toBe(0);
  });

  it('el preset original no modifica metal ni rugosidad', () => {
    const root = prepareModel(
      createModel(new MeshStandardMaterial({ metalness: 0.4, roughness: 0.2 }))
    );
    expect(firstMaterial(root).metalness).toBe(0.4);
    expect(firstMaterial(root).roughness).toBe(0.2);
  });

  it('el tinte reemplaza la textura por un color uniforme y activa las sombras', () => {
    const root = prepareModel(
      createModel(new MeshStandardMaterial({ map: new Texture() })),
      {
        material: 'oro',
        tint: '#e8b44a',
      }
    );
    const mesh = root.children[0];

    expect(mesh.material.color.getHexString()).toBe('e8b44a');
    expect(mesh.material.map).toBeNull();
    expect(mesh.castShadow).toBe(true);
    expect(mesh.receiveShadow).toBe(true);
  });

  it('quita las mallas ajenas a la pieza indicadas por nombre', () => {
    const root = createModel(new MeshStandardMaterial());
    const stand = new Mesh(new BoxGeometry(), new MeshStandardMaterial());
    stand.name = 'Soporte';
    root.add(stand);

    prepareModel(root, { hiddenMeshes: ['Soporte'] });

    expect(root.getObjectByName('Soporte')).toBeUndefined();
    expect(root.children).toHaveLength(1);
  });

  it('no modifica el material compartido del modelo cargado', () => {
    const shared = new MeshStandardMaterial({ metalness: 0 });
    prepareModel(createModel(shared), { material: 'oro' });
    expect(shared.metalness).toBe(0);
  });

  it('calcula las normales de las mallas que no las traen', () => {
    const geometry = new BoxGeometry();
    geometry.deleteAttribute('normal');
    const root = new Group();
    root.add(new Mesh(geometry, new MeshStandardMaterial()));

    prepareModel(root);
    expect(geometry.attributes.normal).toBeDefined();
  });

  it('rechaza presets desconocidos', () => {
    expect(() =>
      prepareModel(createModel(new MeshStandardMaterial()), {
        material: 'madera',
      })
    ).toThrow(/desconocido/);
  });
});

describe('toStandardMaterial', () => {
  it('convierte un material sin iluminación en uno estándar con su textura', () => {
    const map = new Texture();
    const lit = toStandardMaterial(new MeshBasicMaterial({ map }));

    expect(lit.type).toBe('MeshStandardMaterial');
    expect(lit.map).toBe(map);
  });

  it('simplifica los materiales físicos (menos unidades de textura) conservando sus mapas estándar', () => {
    const map = new Texture();
    const normalMap = new Texture();
    const physical = new MeshPhysicalMaterial({
      map,
      normalMap,
      metalness: 1,
      roughness: 0.3,
      specularIntensityMap: new Texture(),
    });
    const standard = toStandardMaterial(physical);

    expect(standard.type).toBe('MeshStandardMaterial');
    expect(standard.isMeshPhysicalMaterial).toBeFalsy();
    expect(standard.map).toBe(map);
    expect(standard.normalMap).toBe(normalMap);
    expect(standard.metalness).toBe(1);
    expect(standard.roughness).toBe(0.3);
  });

  it('devuelve una copia de los materiales estándar, sin modificar el original', () => {
    const material = new MeshStandardMaterial();
    const copy = toStandardMaterial(material);
    expect(copy).not.toBe(material);
    expect(copy.type).toBe('MeshStandardMaterial');
  });
});

describe('fitToSize', () => {
  it('escala la dimensión mayor al tamaño pedido y apoya el modelo en y = 0', () => {
    const box = new Box3(new Vector3(-1, 2, -0.5), new Vector3(3, 4, 0.5));
    const { scale, position } = fitToSize(box, 0.5);

    expect(scale).toBeCloseTo(0.125); // ancho 4 → 0.5 m
    expect(position[0]).toBeCloseTo(-0.125); // centro x = 1
    expect(position[1]).toBeCloseTo(-0.25); // base y = 2
    expect(position[2]).toBeCloseTo(0);
  });
});
