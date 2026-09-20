import { ContentType, AspectRatio, ProjectLanguage } from '../types';

export interface ContentTypeOption {
  id: ContentType;
  label: string;
  description: string;
  badge: string;
  defaultFormat: AspectRatio;
  iconName: string;
}

export interface FormatOption {
  id: AspectRatio;
  label: string;
  sublabel: string;
  ratioWidth: number;
  ratioHeight: number;
  description: string;
  iconName: string;
}

export interface LanguageOption {
  id: ProjectLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const CONTENT_TYPE_OPTIONS: ContentTypeOption[] = [
  {
    id: 'court-metrage',
    label: 'Court Métrage',
    description: 'Fiction narrative cinématographique avec arcs dramatiques et plans soignés.',
    badge: 'Cinéma',
    defaultFormat: '16:9',
    iconName: 'Film'
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    description: 'Récits captivants, anecdotes immersives et confidences à fort impact émotionnel.',
    badge: 'Narratif',
    defaultFormat: '9:16',
    iconName: 'BookOpen'
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    description: 'Format court ultra-dynamique avec accroche dès les 3 premières secondes.',
    badge: 'Viral',
    defaultFormat: '9:16',
    iconName: 'Zap'
  },
  {
    id: 'instagram-reel',
    label: 'Instagram Reel',
    description: 'Contenu léché, esthétique visuelle soignée pour maximiser le taux de rétention.',
    badge: 'Social',
    defaultFormat: '9:16',
    iconName: 'Flame'
  },
  {
    id: 'youtube-short',
    label: 'YouTube Short',
    description: 'Pédagogie rapide, faits surprenants ou récapitulatifs percutants.',
    badge: 'Shorts',
    defaultFormat: '9:16',
    iconName: 'PlayCircle'
  },
  {
    id: 'publicite',
    label: 'Publicité / Commercial',
    description: 'Spot promotionnel, présentation produit, storytelling de marque et CTA irrésistible.',
    badge: 'Business',
    defaultFormat: '16:9',
    iconName: 'Megaphone'
  },
  {
    id: 'documentaire',
    label: 'Documentaire',
    description: 'Exploration d’un sujet historique, scientifique ou naturel avec voix posée.',
    badge: 'Culture',
    defaultFormat: '16:9',
    iconName: 'Compass'
  },
  {
    id: 'histoire-enfants',
    label: 'Histoire pour Enfants',
    description: 'Conte merveilleux, univers féérique avec personnages attachants et morale.',
    badge: 'Jeunesse',
    defaultFormat: '16:9',
    iconName: 'Sparkles'
  },
  {
    id: 'clip-musical',
    label: 'Clip Musical',
    description: 'Poésie visuelle rythmée, synesthésie d’images et transitions fortes sur tempo.',
    badge: 'Musique',
    defaultFormat: '16:9',
    iconName: 'Music'
  }
];

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: '9:16',
    label: '9:16 Vertical',
    sublabel: 'Mobile & Socials',
    ratioWidth: 9,
    ratioHeight: 16,
    description: 'Idéal pour TikTok, Instagram Reels, YouTube Shorts et Stories plein écran.',
    iconName: 'Smartphone'
  },
  {
    id: '16:9',
    label: '16:9 Panoramique',
    sublabel: 'Cinéma & Écrans',
    ratioWidth: 16,
    ratioHeight: 9,
    description: 'Le format standard du cinéma, de YouTube classique et des écrans horizontaux.',
    iconName: 'Monitor'
  },
  {
    id: '1:1',
    label: '1:1 Carré',
    sublabel: 'Feeds & Multiplateforme',
    ratioWidth: 1,
    ratioHeight: 1,
    description: 'Format universel équilibré pour les fils d’actualité Instagram, LinkedIn et Facebook.',
    iconName: 'Square'
  }
];

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'fr', label: 'Français', nativeLabel: 'Français', flag: '🇫🇷' },
  { id: 'en', label: 'Anglais', nativeLabel: 'English', flag: '🇬🇧' },
  { id: 'es', label: 'Espagnol', nativeLabel: 'Español', flag: '🇪🇸' },
  { id: 'de', label: 'Allemand', nativeLabel: 'Deutsch', flag: '🇩🇪' },
  { id: 'it', label: 'Italien', nativeLabel: 'Italiano', flag: '🇮🇹' },
  { id: 'ja', label: 'Japonais', nativeLabel: '日本語', flag: '🇯🇵' },
  { id: 'pt', label: 'Portugais', nativeLabel: 'Português', flag: '🇵🇹' },
  { id: 'ar', label: 'Arabe', nativeLabel: 'العربية', flag: '🇸🇦' }
];
