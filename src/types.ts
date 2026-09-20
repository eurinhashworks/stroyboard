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

export interface Scene {
  id: string;
  number: number;
  voiceover: string;
  visualDescription: string;
  imagePrompt: string;
  onScreenText: string;
  emotion: string;
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

