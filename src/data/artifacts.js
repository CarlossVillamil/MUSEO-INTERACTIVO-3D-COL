/**
 * Catálogo de artefactos exhibidos en las vitrinas.
 *
 * - `model`: GLB optimizado (`pnpm optimize:models`) dentro de `public/models/`.
 * - `material`: preset PBR que se aplica sobre las texturas del modelo
 *   (ver `scene/materials.js`); `tint` lo reemplaza por un color uniforme.
 * - `size`: dimensión mayor con la que se exhibe la pieza, en metros.
 * - `rotation`: corrección de orientación del modelo original (radianes).
 * - `hiddenMeshes`: mallas del escaneo ajenas a la pieza (soportes, fotos).
 * - `source`: crédito del modelo 3D (licencias CC exigen atribución).
 *
 * El orden dentro de cada sala define la vitrina que ocupa cada pieza.
 */
export const ARTIFACTS = [
  // ── Sala Precolombina ───────────────────────────────────────────────
  {
    id: 'pechera-tairona',
    roomId: 'sala-precolombina',
    name: 'Pechera tairona',
    description:
      'Pectoral de orfebrería tairona con espirales, de la Sierra Nevada de Santa Marta.',
    model: 'pre-colombina/tairona_-_pechera_de_oro.glb',
    material: 'oro',
    // La textura del modelo es casi blanca: se representa en oro uniforme
    tint: '#d9a441',
    size: 0.3,
    source: {
      author: 'carlosbonett',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/tairona-pechera-de-oro-3020433d419b45fbb3f19f6d68187858',
    },
  },
  {
    id: 'popora-de-oro',
    roomId: 'sala-precolombina',
    name: 'Poporo de oro',
    description:
      'Recipiente para la cal que se mezclaba con la hoja de coca en rituales (recreación).',
    model: 'pre-colombina/popora_de_oro.glb',
    material: 'oro',
    size: 0.3,
    source: {
      author: 'dianarico4D',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/popora-de-oro-4f9fa50321e94e05beb320f4e3f7395a',
    },
  },
  {
    id: 'balsa-muisca',
    roomId: 'sala-precolombina',
    name: 'Balsa Muisca (representación)',
    description:
      'Evoca la balsa ceremonial muisca de la laguna de Guatavita, origen de la leyenda de El Dorado.',
    model: 'pre-colombina/balsa.glb',
    material: 'oro',
    tint: '#e8b44a',
    size: 0.45,
    source: {
      author: 'Francesco Coldesina',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/raft-775c11780ac6434aaf733f7b1971a0c6',
    },
  },
  {
    id: 'nariguera-tairona',
    roomId: 'sala-precolombina',
    name: 'Nariguera zoomorfa tairona',
    description: 'Adorno nasal de oro con forma animal (900 – 1600 d.C.).',
    model: 'pre-colombina/tairona_-_nariguera_zoomorfa.glb',
    material: 'oro',
    size: 0.25,
    source: {
      author: 'carlosbonett',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/tairona-nariguera-zoomorfa-410768b16b94404f81dedd8e2a25b138',
    },
  },
  {
    id: 'colgante-antropomorfo-tairona',
    roomId: 'sala-precolombina',
    name: 'Colgante antropomorfo tairona',
    description: 'Colgante de oro con figura humana de la cultura tairona.',
    model: 'pre-colombina/tairona_culture_anthropomorphic_pendant.glb',
    material: 'oro',
    rotation: [0, Math.PI / 2, 0],
    size: 0.25,
    source: {
      author: 'Virtual Museums of Małopolska',
      license: 'CC0 1.0',
      url: 'https://sketchfab.com/3d-models/tairona-culture-anthropomorphic-pendant-f5cbe7dc7ee54be7a338fe7047f87dcd',
    },
  },
  {
    id: 'colgante-murcielago-tairona',
    roomId: 'sala-precolombina',
    name: 'Colgante murciélago tairona',
    description: 'Colgante zoomorfo de oro con forma de murciélago.',
    model: 'pre-colombina/tairona_culture_zoomorphic_pendant__bat.glb',
    material: 'oro',
    size: 0.25,
    source: {
      author: 'Virtual Museums of Małopolska',
      license: 'CC0 1.0',
      url: 'https://sketchfab.com/3d-models/tairona-culture-zoomorphic-pendant-bat-d9574b5bba2c443a948be5a13cb09dca',
    },
  },
  {
    id: 'tunjo-muisca',
    roomId: 'sala-precolombina',
    name: 'Tunjo muisca',
    description:
      'Figura votiva que se ofrendaba en rituales del altiplano cundiboyacense (recreación).',
    model: 'pre-colombina/tunjo_precolombino.glb',
    material: 'oro',
    size: 0.3,
    source: {
      author: 'JSML8',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/tunjo-precolombino-1db16bfb1f4c4cb58dc56daed058b4bf',
    },
  },
  {
    id: 'remate-baston-zenu',
    roomId: 'sala-precolombina',
    name: 'Remate de bastón zenú',
    description:
      'Remate de bastón de orfebrería zenú con forma animal (200 a.C. – 1000 d.C.).',
    model: 'pre-colombina/zenu_-_remate_de_baston_horizontal_zoomorfo.glb',
    material: 'oro',
    size: 0.3,
    source: {
      author: 'carlosbonett',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/zenu-remate-de-baston-horizontal-zoomorfo-f5cb252119bf4771a2a890f3db24fc1c',
    },
  },
  {
    id: 'instrumento-zoomorfo',
    roomId: 'sala-precolombina',
    name: 'Instrumento musical zoomorfo',
    description:
      'Instrumento cerámico con forma animal de la tradición tairona.',
    model: 'pre-colombina/instrumento_musical_zoomorfo.glb',
    material: 'ceramica',
    size: 0.3,
    source: {
      author: 'Instituto Colombiano de Antropología e Historia',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/instrumento-musical-zoomorfo-12e1f2d5723644b8ad2c5d99ed05b147',
    },
  },

  // ── Sala de la Colonia ──────────────────────────────────────────────
  {
    id: 'morrion-espanol',
    roomId: 'sala-colonia',
    name: 'Morrión español',
    description:
      'Casco de infantería con cresta y ala curva, típico de los soldados españoles de los siglos XVI y XVII.',
    model: 'colonial/spanish_morion_helmet.glb',
    material: 'metal',
    size: 0.35,
    source: {
      author: 'm.altay',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/spanish-morion-helmet-d16ade982443485b8e39235e12316770',
    },
  },
  {
    id: 'mosquete-colonial',
    roomId: 'sala-colonia',
    name: 'Mosquete de soldado colonial',
    description:
      'Réplica de mosquete de chispa del siglo XVIII, como los de los soldados de la Corona española.',
    model: 'colonial/18th_century_musket_replica.glb',
    material: 'original',
    size: 0.65,
    source: {
      author: 'The Center for Digital Humanities UArizona',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/18th-century-musket-replica-fe953d818e8745daa6b6b8c6ac63e08c',
    },
  },
  {
    id: 'botija',
    roomId: 'sala-colonia',
    name: 'Botija',
    description:
      'Vasija para transportar aceite, vino y vinagre entre España y América (réplica).',
    model: 'colonial/botija_de_boca_de_vinagre.glb',
    material: 'ceramica',
    size: 0.45,
    source: {
      author: 'Grupo PRINMA UGR',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/botija-de-boca-de-vinagre-5a040b133fd643bbaf5ba0d9883e0c92',
    },
  },
  {
    id: 'bacinilla-porcelana',
    roomId: 'sala-colonia',
    name: 'Bacinilla de porcelana',
    description: 'Pieza doméstica de porcelana de la época colonial (c. 1789).',
    model: 'colonial/bacinilla_de_porcelana_antigua.glb',
    material: 'original',
    // El escaneo incluye un tablero, una foto y un disco de apoyo
    hiddenMeshes: ['Object_4', 'Object_8', 'Object_10'],
    size: 0.3,
    source: {
      author: 'franciscomedina77',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/bacinilla-de-porcelana-antigua-f57e65b593e54fc08c31dd969aee6e9c',
    },
  },
  {
    id: 'virgen-maria',
    roomId: 'sala-colonia',
    name: 'Talla de la Virgen María',
    description:
      'Escultura religiosa colonial policromada (Guatemala), muestra del arte sacro de la época.',
    model: 'colonial/figure_of_the_virgin_mary.glb',
    material: 'original',
    size: 0.5,
    source: {
      author: 'Global Digital Heritage and GDH-Afrika',
      license: 'CC BY-NC 4.0',
      url: 'https://sketchfab.com/3d-models/figure-of-the-virgin-mary-11016f5de0b045229828a900f2aa6c98',
    },
  },

  // ── Sala de la Independencia ────────────────────────────────────────
  {
    id: 'florero-de-llorente',
    roomId: 'sala-independencia',
    name: 'Florero de Llorente (representación)',
    description:
      'El 20 de julio de 1810 el préstamo negado de un florero desencadenó la revuelta que inició la independencia.',
    model: 'independencia/florero_llorente.glb',
    material: 'original',
    size: 0.35,
    source: {
      author: 'The Hunt Museum',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/porcelain-vase-d6554d72a1604329bec9756daded361d',
    },
  },
  {
    id: 'acta-de-independencia',
    roomId: 'sala-independencia',
    name: 'Acta de Independencia (representación)',
    description:
      'Firmada por el Cabildo de Santa Fe en 1810, estableció la Junta Suprema de Gobierno.',
    model: 'independencia/acta_independencia.glb',
    material: 'original',
    rotation: [0, Math.PI / 2, 0],
    size: 0.5,
    source: {
      author: 'mana5677',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/antique-floral-bordered-manuscript-roll-c2bf382309164959923290298eaeb881',
    },
  },
  {
    id: 'busto-bolivar',
    roomId: 'sala-independencia',
    name: 'Busto de Simón Bolívar',
    description:
      'El Libertador, líder de la campaña que culminó en la Batalla de Boyacá (1819).',
    model: 'independencia/simon_bolivar.glb',
    material: 'piedra',
    size: 0.5,
    source: {
      author: 'victorberdugo1',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/simon-bolivar-803a5050d55947d4b0c6f54f9281bd37',
    },
  },
  {
    id: 'escultura-bolivar',
    roomId: 'sala-independencia',
    name: 'Escultura de Simón Bolívar',
    description: 'Escaneo 3D de una escultura del Libertador.',
    model: 'independencia/simon_bolivar_scanner_3d_simplified_3d_mesh.glb',
    material: 'piedra',
    size: 0.5,
    source: {
      author: 'Documentaciondepatrimonio',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/simon-bolivar-scanner-3d-simplified-3d-mesh-00ca97b1723544e69efad47e23eef833',
    },
  },
  {
    id: 'sable-caballeria',
    roomId: 'sala-independencia',
    name: 'Sable de caballería ligera',
    description:
      'Sable modelo 1796, de la época de las guerras de independencia.',
    model: 'independencia/pattern_1796_light_cavalry_saber_trooper.glb',
    material: 'original',
    size: 0.65,
    source: {
      author: 'The Oakeshott Institute',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/pattern-1796-light-cavalry-saber-trooper-f4e2422d535e4d3289eafaebceea80dc',
    },
  },
  {
    id: 'bicornio',
    roomId: 'sala-independencia',
    name: 'Bicornio',
    description: 'Sombrero de dos picos que usaban los oficiales de la época.',
    model: 'independencia/bicorn_hat.glb',
    material: 'original',
    rotation: [0, Math.PI / 2, 0],
    size: 0.4,
    source: {
      author: 'alban',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/bicorn-hat-596276d408ac40f1817bc7c1d710fa63',
    },
  },
  {
    id: 'mosquete-chispa',
    roomId: 'sala-independencia',
    name: 'Mosquete de chispa',
    description:
      'Arma de avancarga común en los ejércitos de comienzos del siglo XIX.',
    model: 'independencia/flintlock_musket_12858.glb',
    material: 'original',
    size: 0.65,
    source: {
      author: 'Stanford University Archaeology Collections',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/flintlock-musket-12858-7e070a9406364d1daf5ff730fee17167',
    },
  },
  {
    id: 'pistola-chispa',
    roomId: 'sala-independencia',
    name: 'Pistola de chispa',
    description:
      'Pistola de avancarga con mecanismo de chispa (siglos XVII – XIX).',
    model: 'independencia/flintlock_pistol.glb',
    material: 'original',
    size: 0.4,
    source: {
      author: 'Arms Museum',
      license: 'CC0 1.0',
      url: 'https://sketchfab.com/3d-models/flintlock-pistol-792ca024195d4292829d8d0b304ced30',
    },
  },
  {
    id: 'canon-campana',
    roomId: 'sala-independencia',
    name: 'Cañón de campaña',
    description:
      'Pieza de artillería de la época napoleónica, contemporánea a las guerras de independencia.',
    model: 'independencia/napoleonic_era_cannon.glb',
    material: 'metal',
    // El modelo no trae texturas: hierro oscuro
    tint: '#3b3734',
    rotation: [0, Math.PI / 2, 0],
    size: 0.6,
    source: {
      author: 'Metehan',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/napoleonic-era-cannon-4f8d69ba311745dda220dbde960d5fc6',
    },
  },

  // ── Sala de la República ────────────────────────────────────────────
  {
    id: 'telefono-antiguo',
    roomId: 'sala-republica',
    name: 'Teléfono antiguo',
    description: 'Teléfono de los primeros tiempos de la telefonía.',
    model: 'republica/antique_telephone.glb',
    material: 'original',
    size: 0.3,
    source: {
      author: 'fakevalerie',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/antique-telephone-46da0e25122b456b9f52930e58ce4bf9',
    },
  },
  {
    id: 'gramofono',
    roomId: 'sala-republica',
    name: 'Gramófono',
    description:
      'Reproductor de discos que popularizó la música grabada a comienzos del siglo XX.',
    model: 'republica/gramophone.glb',
    material: 'original',
    size: 0.5,
    source: {
      author: 'Loïc',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/gramophone-2458f980cf584c45a130df3fc39d47ff',
    },
  },
  {
    id: 'molino-de-cafe',
    roomId: 'sala-republica',
    name: 'Molino de café',
    description:
      'El café fue el principal producto de exportación de Colombia durante el siglo XX.',
    model: 'republica/antique_coffee_mill.glb',
    material: 'original',
    size: 0.3,
    source: {
      author: 'NollieInward',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/antique-coffee-mill-a2e7039bc333471291fa44b452d4439a',
    },
  },
  {
    id: 'bandola-andina',
    roomId: 'sala-republica',
    name: 'Bandola andina colombiana',
    description:
      'Instrumento de cuerda pulsada de la música tradicional andina colombiana.',
    model: 'republica/colombian_andean_bandola_colombian_instrument.glb',
    material: 'original',
    size: 0.5,
    source: {
      author: 'Leonardo Marcelo',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/colombian-andean-bandola-colombian-instrument-2ec86b3f1e6a424496de5947aa220e35',
    },
  },
  {
    id: 'sombrero-vueltiao',
    roomId: 'sala-republica',
    name: 'Sombrero vueltiao',
    description:
      'Tejido en caña flecha por el pueblo zenú; símbolo cultural de la Nación (Ley 908 de 2004).',
    model: 'republica/sombrero_vueltiao_colombia.glb',
    material: 'original',
    size: 0.35,
    source: {
      author: 'Juan David',
      license: 'CC BY 4.0',
      url: 'https://sketchfab.com/3d-models/sombrero-vueltiao-colombia-626560a80beb4edc992b001f8b54e714',
    },
  },
];

/** Carpeta pública de los modelos optimizados. */
export const MODELS_BASE_URL = '/models/';

export const getArtifactById = (artifactId) =>
  ARTIFACTS.find((artifact) => artifact.id === artifactId) ?? null;

export const getArtifactsByRoom = (roomId) =>
  ARTIFACTS.filter((artifact) => artifact.roomId === roomId);
