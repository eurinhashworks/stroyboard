import { PresetStory, VisualStyle } from '../types';

export const PRESET_STORIES: PresetStory[] = [
  {
    id: 'l-horloger-du-temps',
    title: "L'Horloger d'Édimbourg",
    tag: 'Drame Fantastique / Époque',
    icon: 'Compass',
    mood: 'Mystique & Émotionnel',
    text: "Hiver 1892, dans les ruelles pavées d'Édimbourg balayées par un blizzard glacial. Arthur Vance, un vieil horloger solitaire aux mains tremblantes, conserve dans son atelier secret une montre à gousset dorée aux engrenages inversés : le Chronomètre d'Ouroboros. Soudain, la porte s'ouvre avec fracas. Éléonore, sa petite-fille qu'il croyait perdue en mer depuis cinq ans, franchit le seuil, vêtue d'un manteau trempé. Ses yeux brillent d'une lueur étrange. « Grand-père, murmure-t-elle d'une voix brisée, ils ont retrouvé la trace du mécanisme. Tu dois remonter l'aiguille avant le douzième coup. » Au loin, les sabots d'une calèche noire s'arrêtent devant la vitrine embuée. Arthur saisit l'artefact alors que les rouages s'emballent dans une étincelle azur."
  },
  {
    id: 'mystere-nocturne',
    title: 'Le Testament de minuit',
    tag: 'Thriller / Néo-Noir',
    icon: 'Moon',
    mood: 'Sombre & Suspense',
    text: "Novembre 1954, quai de la Seine sous une pluie battante. L'inspecteur Gabriel Moreau attend sous un réverbère clignotant, serrant une sacoche en cuir renfermant les aveux du préfet. Une silhouette élégante émerge des ombres : Clara Delacroix, ancienne cantatrice devenue informatrice clandestine. « Gabriel, tu n'aurais jamais dû venir seul », souffle-t-elle en lui tendant un revolver au barillet vide. Deux phares aveuglants déchirent alors le brouillard, accompagnés par le rugissement d'une Traction Avant. Gabriel doit choisir entre sauver Clara ou plonger dans les eaux glacées pour protéger les preuves."
  },
  {
    id: 'future-cyber',
    title: 'La Brèche de Neo-Sora',
    tag: 'Sci-Fi / Cyberpunk',
    icon: 'Zap',
    mood: 'Futuriste & Haletant',
    text: "An 2114, dans les bas-fonds de Neo-Sora illuminés par des néons holographiques géants. Maya Kross, une hackeuse renégate aux implants cybernétiques instables, transporte dans une cyber-mallette cryogénisée la dernière graine végétale vivante de la Terre. Traquée par les drones sentinelles du Consortium Apex, elle s'engouffre dans un hangar abandonné. Son ancien complice Ren l'attend sur une passerelle rouillée, arme pointée sur elle. « Donne-moi la graine Maya, et ils effaceront ta prime », ordonne-t-il. Maya active sa visière neurale : « Cette graine n'appartient à personne, Ren. Elle appartient au ciel. » Maya déclenche une grenade IEM, plongeant tout le secteur dans le noir total."
  },
  {
    id: 'odyssee-nature',
    title: 'Le Sanctuaire du Silence',
    tag: 'Aventure / Épique',
    icon: 'Sparkles',
    mood: 'Épique & Poétique',
    text: "Aux confins des hauts plateaux de l'Himalaya, à l'aube d'un solstice d'été. Tenzin, un jeune moine herboriste, grimpe vers la falaise des Mille Prières pour cueillir la légendaire Fleur de Jade, réputée capable de guérir le mal mystérieux qui frappe son village natal. Face à lui, sur une corniche vertigineuse, apparaît un léopard des neiges aux yeux d'or, gardien séculaire du sanctuaire. Au lieu de fuir, Tenzin s'agenouille, pose son bâton de pèlerin et entonne le chant ancestral de paix. L'animal s'approche doucement, flairant la clochette en cuivre du novice avant de s'écarter pour révéler la fleur baignée par les premiers rayons du soleil."
  }
];

export const VISUAL_STYLES: VisualStyle[] = [
  {
    id: 'cinematic-35mm',
    label: 'Cinématographique 35mm',
    promptModifier: 'Cinematic 35mm film still, anamorphic lens, Arri Alexa, beautiful film grain, dramatic shallow depth of field, atmospheric volumetric lighting, master director composition, ultra-detailed 8k.'
  },
  {
    id: 'film-noir',
    label: 'Néo-Noir & Brume',
    promptModifier: 'Dark moody neo-noir cinematography, high contrast shadows, wet asphalt reflections, atmospheric mist, street lamps glow, cinematic color grading, blade runner vibe.'
  },
  {
    id: 'documentaire',
    label: 'Documentaire 4K National Geographic',
    promptModifier: 'National Geographic style, 4k ultra-realistic photojournalism, natural sunlight, raw textures, authentic atmosphere, wide lens, crisp fine details.'
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk & Néons',
    promptModifier: 'Cyberpunk aesthetic, glowing vibrant neon lights, cyan and magenta rim light, futuristic metropolis background, rain particles, cinematic reflections.'
  },
  {
    id: 'vintage-70s',
    label: 'Vintage Kodak Portra',
    promptModifier: 'Vintage 1970s film aesthetic, Kodak Portra 400 tones, warm pastel hues, soft nostalgic halation, authentic analog imperfections, sun flare.'
  }
];
