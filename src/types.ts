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
