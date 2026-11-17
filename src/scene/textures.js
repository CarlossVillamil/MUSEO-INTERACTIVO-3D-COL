import { CanvasTexture, Color, RepeatWrapping, SRGBColorSpace } from 'three';

/**
 * Texturas de los materiales del claustro, dibujadas en un canvas al cargar
 * (sin descargar imágenes): baldosa de barro con juntas, losas de piedra,
 * concreto pulido y cal. Cada una representa un módulo de `tileSize` metros
 * y se repite según el tamaño de la superficie.
 */

const SIZE = 512;

// Generador pseudoaleatorio con semilla: la textura es igual en cada carga
function random(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Ruido de manchas suaves (círculos difusos de opacidad baja). */
function mottle(
  ctx,
  rand,
  { count, minRadius, maxRadius, alpha, light, dark }
) {
  for (let i = 0; i < count; i++) {
    const x = rand() * SIZE;
    const y = rand() * SIZE;
    const radius = minRadius + rand() * (maxRadius - minRadius);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const color = rand() > 0.5 ? light : dark;
    gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = gradient;
    // Se dibuja también desplazado para que la textura empalme sin cortes
    [-SIZE, 0, SIZE].forEach((dx) =>
      [-SIZE, 0, SIZE].forEach((dy) => {
        ctx.save();
        ctx.translate(dx, dy);
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();
      })
    );
  }
}

/** Grano fino: puntos claros y oscuros sobre toda la superficie. */
function grain(ctx, rand, amount, alpha) {
  for (let i = 0; i < amount; i++) {
    ctx.fillStyle =
      rand() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(rand() * SIZE, rand() * SIZE, 1.5, 1.5);
  }
}

function shade(hex, amount) {
  const color = new Color(hex);
  color.offsetHSL(0, 0, amount);
  return `#${color.getHexString()}`;
}

/**
 * Piezas cuadradas (baldosas o losas) separadas por juntas, cada una con
 * un tono apenas distinto.
 */
function tiles(ctx, rand, { color, grout, perSide, variation, groutWidth }) {
  const tile = SIZE / perSide;
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let row = 0; row < perSide; row++) {
    for (let col = 0; col < perSide; col++) {
      ctx.fillStyle = shade(color, (rand() - 0.5) * variation);
      ctx.fillRect(
        col * tile + groutWidth / 2,
        row * tile + groutWidth / 2,
        tile - groutWidth,
        tile - groutWidth
      );
    }
  }
}

function createTexture(draw, seed) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  draw(ctx, random(seed));
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

const MATERIALS = {
  // Baldosa de barro cocido de 30 cm, como en las galerías coloniales
  baldosa: {
    tileSize: 1.2,
    draw: (ctx, rand, color) => {
      tiles(ctx, rand, {
        color,
        grout: shade(color, -0.12),
        perSide: 4,
        variation: 0.08,
        groutWidth: 5,
      });
      mottle(ctx, rand, {
        count: 60,
        minRadius: 20,
        maxRadius: 70,
        alpha: 0.08,
        light: '255,230,200',
        dark: '60,25,10',
      });
      grain(ctx, rand, 9000, 0.06);
    },
  },
  // Losas de piedra de 60 cm para el patio y el vestíbulo
  piedra: {
    tileSize: 2.4,
    draw: (ctx, rand, color) => {
      tiles(ctx, rand, {
        color,
        grout: shade(color, -0.1),
        perSide: 4,
        variation: 0.06,
        groutWidth: 3,
      });
      mottle(ctx, rand, {
        count: 140,
        minRadius: 8,
        maxRadius: 40,
        alpha: 0.07,
        light: '255,250,240',
        dark: '70,60,45',
      });
      grain(ctx, rand, 14000, 0.07);
    },
  },
  // Concreto pulido de las salas, con juntas cada 3 m
  concreto: {
    tileSize: 3,
    draw: (ctx, rand, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, SIZE, SIZE);
      mottle(ctx, rand, {
        count: 70,
        minRadius: 60,
        maxRadius: 160,
        alpha: 0.025,
        light: '255,255,255',
        dark: '0,0,0',
      });
      grain(ctx, rand, 6000, 0.04);
      ctx.fillStyle = shade(color, -0.06);
      ctx.fillRect(0, 0, SIZE, 2);
      ctx.fillRect(0, 0, 2, SIZE);
    },
  },
  // Muro encalado: manchas amplias y muy suaves
  cal: {
    tileSize: 4,
    draw: (ctx, rand, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, SIZE, SIZE);
      mottle(ctx, rand, {
        count: 90,
        minRadius: 40,
        maxRadius: 140,
        alpha: 0.05,
        light: '255,255,255',
        dark: '90,80,60',
      });
      grain(ctx, rand, 5000, 0.035);
    },
  },
};

const cache = new Map();

/**
 * Textura del material `kind` en `color`, repetida para cubrir una
 * superficie de `width` × `height` metros.
 */
export function getSurfaceTexture(kind, color, width, height) {
  const { tileSize, draw } = MATERIALS[kind];
  const key = `${kind}:${color}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      createTexture((ctx, rand) => draw(ctx, rand, color), key.length * 977)
    );
  }
  const texture = cache.get(key).clone();
  texture.repeat.set(width / tileSize, height / tileSize);
  texture.needsUpdate = true;
  return texture;
}
