export type ContentType = 
  | 'court-metrage'
  | 'storytelling'
  | 'tiktok'
  | 'instagram-reel'
  | 'youtube-short'
  | 'publicite'
  | 'documentaire'
  | 'histoire-enfants'
  | 'clip-musical';

export type AspectRatio = '9:16' | '16:9' | '1:1';

export type ProjectLanguage = 'fr' | 'en' | 'es' | 'de' | 'it' | 'ja' | 'pt' | 'ar';

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export interface NarrativeCharacter {
  nom: string;
  role: string;
  description: string;
}

export interface NarrativeLocation {
  nom: string;
  description: string;
  ambiance: string;
}

export interface NarrativeItem {
  nom: string;
  signification: string;
  roleNarratif: string;
}

export interface NarrativeStructure {
  debut: string;
  developpement: string;
  climax: string;
  conclusion: string;
}

export interface NarrativeAnalysis {
  personnages: NarrativeCharacter[];
  lieux: NarrativeLocation[];
  epoque: string;
  objetsImportants: NarrativeItem[];
  actions: string[];
  evenements: string[];
  dialogues: string[];
  emotions: string[];
  ambiance: string;
  conflitPrincipal: string;
  structure: NarrativeStructure;
}

export type NarrativeImportance = 'Introduction' | 'Développement' | 'Clé' | 'Transition' | 'Climax' | 'Conclusion';

export interface Scene {
  id: string;
  scene_id?: string;
  number: number;
  titre?: string;
  resume?: string;
  lieu?: string;
  moment?: string;
  personnages?: string[];
  action?: string;
  emotion: string;
  dialogue?: string;
  narration?: string;
  voiceover: string;
  duree_estimee?: string;
  importance_narrative?: NarrativeImportance;
  visualDescription: string;
  imagePrompt: string;
  onScreenText: string;
  cameraMovement: string;
  duration: string;
  previewUrl?: string;
  audioUrl?: string;
}

export interface Storyboard {
  scenes: Scene[];
  recommendedMusic: string;
  finalCTA: string;
  ambianceAudioUrl?: string;
  narrativeAnalysis?: NarrativeAnalysis;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  format: AspectRatio;
  language: ProjectLanguage;
  visualStyleId: string;
  status: ProjectStatus;
  narration?: string;
  narrativeAnalysis?: NarrativeAnalysis;
  storyboard?: Storyboard;
  targetTotalDuration?: number;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface ProjectFormData {
  title: string;
  description: string;
  contentType: ContentType;
  format: AspectRatio;
  language: ProjectLanguage;
  visualStyleId: string;
}

export interface PresetStory {
  id: string;
  title: string;
  tag: string;
  icon: string;
  mood: string;
  text: string;
}

export interface VisualStyle {
  id: string;
  label: string;
  promptModifier: string;
}

