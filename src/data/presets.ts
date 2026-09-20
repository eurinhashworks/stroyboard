import { PresetStory, VisualStyle } from '../types';

export const PRESET_STORIES: PresetStory[] = [
  {
    id: 'mystere-nocturne',
    title: 'Mystère Nocturne',
    tag: 'Thriller / Néo-Noir',
    icon: 'Moon',
    mood: 'Sombre & Suspense',
    text: "La pluie s'abattait sans pitié sur les pavés luisants de la vieille ville. Une silhouette solitaire attendait sous le réverbère vacillant, une enveloppe scellée à la main. Le clocher sonna minuit. C'est à cet instant précis que les phares ont surgi du brouillard."
  },
  {
    id: 'luxe-parfum',
    title: 'Essence d’Or',
    tag: 'Spot Publicitaire Luxe',
    icon: 'Sparkles',
    mood: 'Élégant & Sensoriel',
    text: "Une goutte d'eau perle sur un pétale de rose pourpre à l'aube. Dans un palazzo vénitien baigné de soleil doré, elle s'élance, traînant une robe en soie mordorée. Un regard vers la lagune, un souffle : l'instant où le temps s'arrête."
  },
  {
    id: 'odyssee-nature',
    title: 'Le Sanctuaire Sauvage',
    tag: 'Documentaire Nature',
    icon: 'Compass',
    mood: 'Épique & Poétique',
    text: "Au sommet des crêtes islandaises, le vent hurle une mélodie ancestrale. Les aurores boréales sculptent le ciel de rubans émeraude au-dessus d'un glacier millénaire. Une renarde polaire émerge de la brume, sentinelle d'un monde intouché."
  },
  {
    id: 'future-cyber',
    title: 'Néo-Tokyo 2099',
    tag: 'Sci-Fi / Cyberpunk',
    icon: 'Zap',
    mood: 'Futuriste & Rythmé',
    text: "Entre les gratte-ciel vertigineux baignés d'hologrammes criards, elle active sa visière neurale. Le trafic de navettes magnétiques glisse dans la pluie acide. Un compte à rebours clignote sur sa rétine : '5 secondes avant la brèche'."
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
