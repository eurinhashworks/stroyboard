import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Clapperboard, 
  Sparkles, 
  Send, 
  Loader2, 
  Music, 
  MousePointerClick, 
  Download, 
  Film,
  Plus,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Volume2,
  Trash2,
  Wand2,
  Clock,
  Timer,
  ArrowLeft,
  Edit3,
  Save,
  Check,
  AlertCircle,
  Smartphone,
  Monitor,
  Square,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from "jspdf";
import { domToPng } from 'modern-screenshot';

import { Scene, Storyboard, VisualStyle, Project, ProjectFormData } from './types';
import { PRESET_STORIES, VISUAL_STYLES } from './data/presets';
import { projectsApi } from './services/projectsApi';
import { Navbar } from './components/Navbar';
import { ProjectsHub } from './components/ProjectsHub';
import { ProjectModal } from './components/ProjectModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AudioPlayer } from './components/AudioPlayer';
import { SceneCard } from './components/SceneCard';
import { DirectorMonitor } from './components/DirectorMonitor';
import { StoryboardOverview } from './components/StoryboardOverview';
import { ImageModal } from './components/ImageModal';

// --- Constants ---
const GEMINI_MODEL = "gemini-3.1-pro-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

export default function App() {
  // Project Management states
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<'projects' | 'studio'>('projects');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<'create' | 'edit'>('create');
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Storyboard Creation & Studio states
  const [narration, setNarration] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle>(VISUAL_STYLES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load persistent projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const list = await projectsApi.getAll();
        setProjects(list);
        if (list.length > 0 && !activeProject) {
          setActiveProject(list[0]);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    loadProjects();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Project Action Handlers
  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    setNarration(project.narration || '');
    setStoryboard(project.storyboard || null);
    const matchedStyle = VISUAL_STYLES.find(s => s.id === project.visualStyleId) || VISUAL_STYLES[0];
    setSelectedStyle(matchedStyle);
    setTargetTotalDuration(project.targetTotalDuration || null);
    setCurrentView('studio');
    showToast(`Projet « ${project.title} » ouvert dans le Studio.`, 'info');
  };

  const handleOpenCreateProject = () => {
    setProjectToEdit(null);
    setProjectModalMode('create');
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project: Project) => {
    setProjectToEdit(project);
    setProjectModalMode('edit');
    setIsProjectModalOpen(true);
  };

  const handleSaveProjectForm = async (formData: ProjectFormData) => {
    if (projectModalMode === 'create') {
      const created = await projectsApi.create(formData);
      setProjects(prev => [created, ...prev.filter(p => p.id !== created.id)]);
      setActiveProject(created);
      setNarration('');
      setStoryboard(null);
      const matchedStyle = VISUAL_STYLES.find(s => s.id === created.visualStyleId) || VISUAL_STYLES[0];
      setSelectedStyle(matchedStyle);
      setTargetTotalDuration(null);
      setCurrentView('studio');
      showToast(`Projet « ${created.title} » créé avec succès !`);
    } else if (projectToEdit) {
      const updated = await projectsApi.update(projectToEdit.id, formData);
      setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      if (activeProject?.id === updated.id) {
        setActiveProject(updated);
        const matchedStyle = VISUAL_STYLES.find(s => s.id === updated.visualStyleId) || selectedStyle;
        setSelectedStyle(matchedStyle);
      }
      showToast(`Projet « ${updated.title} » mis à jour !`);
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    try {
      const cloned = await projectsApi.duplicate(project.id);
      setProjects(prev => [cloned, ...prev]);
      showToast(`Projet dupliqué : « ${cloned.title} »`);
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors de la duplication', 'error');
    }
  };

  const handleOpenDeleteModal = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await projectsApi.delete(projectToDelete.id);
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      if (activeProject?.id === projectToDelete.id) {
        const remaining = projects.filter(p => p.id !== projectToDelete.id);
        setActiveProject(remaining[0] || null);
        if (remaining.length === 0) {
          setStoryboard(null);
          setNarration('');
        }
      }
      showToast(`Projet « ${projectToDelete.title} » supprimé.`);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveActiveProjectStoryboard = async () => {
    if (!activeProject) {
      handleOpenCreateProject();
      return;
    }
    setIsSavingProject(true);
    try {
      const updated = await projectsApi.update(activeProject.id, {
        narration,
        storyboard: storyboard || undefined,
        visualStyleId: selectedStyle.id,
        targetTotalDuration: targetTotalDuration || undefined,
        status: storyboard ? 'completed' : 'in_progress'
      });
      setActiveProject(updated);
      setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      showToast(`Projet « ${updated.title} » sauvegardé en base de données !`);
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSavingProject(false);
    }
  };

  // Media generation states
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingAmbiance, setIsGeneratingAmbiance] = useState(false);
  const [regeneratingImages, setRegeneratingImages] = useState<Set<number>>(new Set());

  // Edit and Modal states
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [selectedModalScene, setSelectedModalScene] = useState<Scene | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [targetTotalDuration, setTargetTotalDuration] = useState<number | null>(null);

  const storyboardRef = useRef<HTMLDivElement>(null);
  const sceneElementsRef = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  // Calculate word count and estimated speech duration
  const wordCount = narration.trim() ? narration.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.max(5, Math.round(wordCount / 2.5));

  // --- Storyboard Generation ---
  const generateStoryboard = async () => {
    if (!narration.trim()) return;

    setIsGenerating(true);
    setStreamingText('');
    setError(null);
    setStoryboard(null);
    setEditingIdx(null);

    try {
      const responseStream = await ai.models.generateContentStream({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [{ 
              text: `Tu es un réalisateur et directeur artistique d'élite, spécialisé dans la production cinématographique (${activeProject?.contentType || 'court-métrage'}).
              
Ta mission : Découper la narration suivante en un storyboard professionnel complet, captivant et rythmé.
Format visuel cible : ${activeProject?.format || '9:16'}.
Langue principale : ${activeProject?.language || 'fr'}.
Style visuel cible : ${selectedStyle.label}.
Directives visuelles obligatoires pour les prompts : ${selectedStyle.promptModifier}

Narration source : "${narration}"

INSTRUCTIONS :
1. Découpe l'histoire en scènes courtes de 3 à 5 secondes adaptées au format ${activeProject?.format || '9:16'}.
2. Assure une forte tension émotionnelle et une cohérence visuelle parfaite entre chaque plan.
3. Chaque 'imagePrompt' doit être en anglais, très précis et descriptif (composition ${activeProject?.format || '9:16'}, éclairage cinématique, lentille, ambiance, sujet en action).
4. La voix off ('voiceover') doit être rédigée dans la langue du projet : ${activeProject?.language || 'fr'}.
5. Fournis une recommandation musicale d'ambiance et un appel à l'action final (finalCTA).

Réponds STRICTEMENT au format JSON avec cette structure :
{
  "scenes": [
    {
      "number": number,
      "voiceover": "phrase exacte de la voix off pour ce plan",
      "visualDescription": "description visuelle détaillée pour le réalisateur",
      "imagePrompt": "detailed prompt in English with 9:16 vertical framing, camera specs and lighting",
      "onScreenText": "texte court à incruster à l'écran (punchy)",
      "emotion": "émotion dominante (ex: Mystère, Émerveillement, Suspense)",
      "cameraMovement": "mouvement de caméra (ex: Travelling avant lent, Contre-plongée)",
      "duration": "durée (ex: 3-4s)"
    }
  ],
  "recommendedMusic": "description évocatrice de l'ambiance musicale",
  "finalCTA": "texte d'appel à l'action final percutant"
}` 
            }]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.NUMBER },
                    voiceover: { type: Type.STRING },
                    visualDescription: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING },
                    onScreenText: { type: Type.STRING },
                    emotion: { type: Type.STRING },
                    cameraMovement: { type: Type.STRING },
                    duration: { type: Type.STRING },
                  },
                  required: ["number", "voiceover", "visualDescription", "imagePrompt", "onScreenText", "emotion", "cameraMovement", "duration"]
                }
              },
              recommendedMusic: { type: Type.STRING },
              finalCTA: { type: Type.STRING }
            },
            required: ["scenes", "recommendedMusic", "finalCTA"]
          }
        }
      });

      let fullText = "";
      for await (const chunk of responseStream) {
        fullText += chunk.text;
        setStreamingText(fullText);
      }

      const result = JSON.parse(fullText || '{}');
      if (result.scenes && Array.isArray(result.scenes)) {
        result.scenes = result.scenes.map((s: Scene, i: number) => ({
          ...s,
          id: s.id || `scene-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
          number: i + 1,
        }));
      }
      setStoryboard(result);
      if (activeProject) {
        projectsApi.update(activeProject.id, {
          narration,
          storyboard: result,
          visualStyleId: selectedStyle.id,
          status: 'completed'
        }).then(updated => {
          setActiveProject(updated);
          setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        }).catch(e => console.warn('Background auto-save failed', e));
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la génération du storyboard. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Image Generation ---
  const generateSinglePreview = async (idx: number) => {
    if (!storyboard) return;

    setRegeneratingImages(prev => new Set(prev).add(idx));

    try {
      const projFormat = activeProject?.format === '16:9' ? '16:9' : activeProject?.format === '1:1' ? '1:1' : '9:16';
      const scene = storyboard.scenes[idx];
      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: [{ 
          parts: [{ 
            text: `Cinematic ${projFormat} still shot, professional high-end film production, master lighting, volumetric atmosphere. ${selectedStyle.promptModifier}. Scene details: ${scene.imagePrompt}` 
          }] 
        }],
        config: {
          imageConfig: {
            aspectRatio: projFormat
          }
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        const updatedScenes = [...storyboard.scenes];
        updatedScenes[idx] = {
          ...scene,
          previewUrl: `data:image/png;base64,${imagePart.inlineData.data}`
        };
        setStoryboard({ ...storyboard, scenes: updatedScenes });
        
        // Update modal scene if open
        if (selectedModalScene && selectedModalScene.number === scene.number) {
          setSelectedModalScene(updatedScenes[idx]);
        }
      }
    } catch (err) {
      console.error(`Failed to generate image for scene ${idx + 1}`, err);
    } finally {
      setRegeneratingImages(prev => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  };

  const generatePreviews = async () => {
    if (!storyboard) return;
    setIsGeneratingImages(true);

    for (let i = 0; i < storyboard.scenes.length; i++) {
      if (!storyboard.scenes[i].previewUrl) {
        await generateSinglePreview(i);
      }
    }
    setIsGeneratingImages(false);
  };

  // --- Voiceover & Audio Generation ---
  const generateVoiceovers = async () => {
    if (!storyboard) return;
    setIsGeneratingAudio(true);

    const updatedScenes = [...storyboard.scenes];

    for (let i = 0; i < updatedScenes.length; i++) {
      try {
        const scene = updatedScenes[i];
        if (scene.audioUrl) continue;

        const response = await ai.models.generateContent({
          model: TTS_MODEL,
          contents: [{ parts: [{ text: `Dis de manière cinématographique, immersive et émotionnelle : ${scene.voiceover}` }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' }
              }
            }
          }
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
          updatedScenes[i] = {
            ...scene,
            audioUrl: `data:audio/mp3;base64,${audioData}`
          };
          setStoryboard({ ...storyboard, scenes: [...updatedScenes] });
        }
      } catch (err) {
        console.error(`Failed to generate audio for scene ${i + 1}`, err);
      }
    }
    setIsGeneratingAudio(false);
  };

  const generateAmbiance = async () => {
    if (!storyboard) return;
    setIsGeneratingAmbiance(true);

    try {
      const response = await ai.models.generateContent({
        model: TTS_MODEL,
        contents: [{ parts: [{ text: `Crée une ambiance sonore cinématographique basée sur cette recommandation : ${storyboard.recommendedMusic}. Décris l'atmosphère avec des sons évocateurs.` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' }
            }
          }
        }
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        setStoryboard({
          ...storyboard,
          ambianceAudioUrl: `data:audio/mp3;base64,${audioData}`
        });
      }
    } catch (err) {
      console.error("Failed to generate ambiance audio", err);
    } finally {
      setIsGeneratingAmbiance(false);
    }
  };

  // --- Scene Operations (Move, Duplicate, Delete, Add, Edit) ---
  const moveScene = (index: number, direction: 'up' | 'down') => {
    if (!storyboard) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= storyboard.scenes.length) return;

    const newScenes = [...storyboard.scenes];
    const [movedScene] = newScenes.splice(index, 1);
    newScenes.splice(targetIndex, 0, movedScene);

    const renumbered = newScenes.map((sc, i) => ({
      ...sc,
      number: i + 1,
    }));

    setStoryboard({
      ...storyboard,
      scenes: renumbered,
    });

    if (editingIdx === index) {
      setEditingIdx(targetIndex);
    } else if (editingIdx === targetIndex) {
      setEditingIdx(index);
    }
  };

  const duplicateScene = (index: number) => {
    if (!storyboard) return;
    const sourceScene = storyboard.scenes[index];
    const clonedScene: Scene = {
      ...sourceScene,
      id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      voiceover: `${sourceScene.voiceover} (Copie)`,
    };

    const newScenes = [...storyboard.scenes];
    newScenes.splice(index + 1, 0, clonedScene);

    const renumbered = newScenes.map((sc, i) => ({
      ...sc,
      number: i + 1,
    }));

    setStoryboard({
      ...storyboard,
      scenes: renumbered,
    });
    setTargetTotalDuration(null);
  };

  const deleteScene = (index: number) => {
    if (!storyboard || storyboard.scenes.length <= 1) return;
    const newScenes = storyboard.scenes.filter((_, i) => i !== index);
    const renumbered = newScenes.map((sc, i) => ({
      ...sc,
      number: i + 1,
    }));

    setStoryboard({
      ...storyboard,
      scenes: renumbered,
    });
    setTargetTotalDuration(null);

    if (editingIdx === index) {
      setEditingIdx(null);
    }
  };

  const addScene = () => {
    if (!storyboard) return;
    const nextNum = storyboard.scenes.length + 1;
    const newScene: Scene = {
      id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      number: nextNum,
      voiceover: "Nouvelle réplique de voix off...",
      visualDescription: "Description du plan pour la caméra et les acteurs...",
      imagePrompt: "Cinematic vertical 9:16 shot, atmospheric lighting, high quality film production",
      onScreenText: "Texte à l'écran",
      emotion: "Intense",
      cameraMovement: "Travelling avant",
      duration: "3-4s"
    };

    setStoryboard({
      ...storyboard,
      scenes: [...storyboard.scenes, newScene],
    });
    setEditingIdx(storyboard.scenes.length);
    setTargetTotalDuration(null);
  };

  const handleSaveScene = (idx: number, updatedData: Partial<Scene>) => {
    if (!storyboard) return;
    const updatedScenes = [...storyboard.scenes];
    updatedScenes[idx] = { ...updatedScenes[idx], ...updatedData } as Scene;
    setStoryboard({ ...storyboard, scenes: updatedScenes });
    setEditingIdx(null);
    setTargetTotalDuration(null);
  };

  // Helper to calculate total duration in seconds from an array of scenes
  const calculateTotalDuration = (scenes: Scene[]): number => {
    return scenes.reduce((acc, sc) => {
      const match = sc.duration?.match(/\d+(\.\d+)?/);
      return acc + (match ? parseFloat(match[0]) : 4);
    }, 0);
  };

  // Proportional distribution of targetSeconds across all scenes
  const distributeDurationToScenes = (scenes: Scene[], targetSeconds: number): Scene[] => {
    const count = scenes.length;
    if (count === 0) return scenes;

    // Relative weights based on voiceover word count and/or existing duration
    const weights = scenes.map((s) => {
      const words = (s.voiceover || '').trim().split(/\s+/).filter(Boolean).length;
      const match = s.duration?.match(/\d+(\.\d+)?/);
      const parsed = match ? parseFloat(match[0]) : 0;
      if (words > 0 && parsed > 0) {
        return parsed * 0.35 + words * 0.65;
      }
      if (words > 0) return Math.max(2, words);
      if (parsed > 0) return parsed;
      return 4;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
    const minPerScene = Math.max(1, Math.min(2, Math.floor((targetSeconds / count) * 10) / 10));

    // Compute raw durations rounded to 0.5s increments
    let rawDurations = weights.map((w) =>
      Math.max(minPerScene, Math.round(((w / totalWeight) * targetSeconds) * 2) / 2)
    );

    let currentSum = rawDurations.reduce((a, b) => a + b, 0);
    let diff = Math.round((targetSeconds - currentSum) * 10) / 10;

    let safety = 0;
    while (Math.abs(diff) >= 0.25 && safety < 100) {
      safety++;
      if (diff > 0) {
        let bestIdx = 0;
        let bestScore = -Infinity;
        for (let i = 0; i < count; i++) {
          const score = weights[i] / (rawDurations[i] + 0.1);
          if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
          }
        }
        rawDurations[bestIdx] = Math.round((rawDurations[bestIdx] + 0.5) * 10) / 10;
      } else {
        let bestIdx = -1;
        let bestScore = -Infinity;
        for (let i = 0; i < count; i++) {
          if (rawDurations[i] > minPerScene) {
            const score = rawDurations[i] / (weights[i] + 0.1);
            if (score > bestScore) {
              bestScore = score;
              bestIdx = i;
            }
          }
        }
        if (bestIdx === -1) break;
        rawDurations[bestIdx] = Math.max(minPerScene, Math.round((rawDurations[bestIdx] - 0.5) * 10) / 10);
      }
      currentSum = rawDurations.reduce((a, b) => a + b, 0);
      diff = Math.round((targetSeconds - currentSum) * 10) / 10;
    }

    return scenes.map((scene, i) => ({
      ...scene,
      duration: `${rawDurations[i]}s`,
    }));
  };

  const handleGlobalDurationChange = (newTargetSeconds: number) => {
    if (!storyboard) return;
    setTargetTotalDuration(newTargetSeconds);
    const updatedScenes = distributeDurationToScenes(storyboard.scenes, newTargetSeconds);
    setStoryboard({
      ...storyboard,
      scenes: updatedScenes,
    });
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (!storyboardRef.current || !storyboard) return;
    setIsExporting(true);

    try {
      const imgData = await domToPng(storyboardRef.current, {
        scale: 2,
        backgroundColor: "#07080d",
        quality: 1,
      });

      const element = storyboardRef.current;
      const width = element.offsetWidth;
      const height = element.offsetHeight;

      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`storyboard-director-${Date.now()}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
      setError("Erreur lors de l'exportation du PDF. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleScrollToScene = (idx: number) => {
    const el = sceneElementsRef.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Derived duration metrics for the active storyboard
  const sceneCount = storyboard ? storyboard.scenes.length : 0;
  const currentTotalSeconds = storyboard ? Math.round(calculateTotalDuration(storyboard.scenes)) : 30;
  const activeTargetDuration = targetTotalDuration ?? currentTotalSeconds;
  const minTotalDuration = Math.max(10, Math.round(sceneCount * 2));
  const maxTotalDuration = Math.max(60, Math.round(sceneCount * 10));
  const availablePresets = [15, 30, 45, 60].filter(
    (preset) => preset >= minTotalDuration && preset <= maxTotalDuration
  );

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 font-sans flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Top Studio Navbar */}
      <Navbar
        storyboard={storyboard}
        activeProject={activeProject}
        currentView={currentView}
        onChangeView={setCurrentView}
        onSaveProject={handleSaveActiveProjectStoryboard}
        isSaving={isSavingProject}
        onOpenNewProject={handleOpenCreateProject}
        isExporting={isExporting}
        onExportPDF={exportToPDF}
        onReset={() => {
          if (window.confirm("Créer un nouveau storyboard pour ce projet ? Le storyboard actuel sera réinitialisé.")) {
            setStoryboard(null);
            setNarration('');
            setStreamingText('');
            setError(null);
          }
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {currentView === 'projects' ? (
          <ProjectsHub
            projects={projects}
            activeProjectId={activeProject?.id}
            onSelectProject={handleSelectProject}
            onCreateNew={handleOpenCreateProject}
            onEditProject={handleOpenEditProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleOpenDeleteModal}
          />
        ) : (
          <>
            {/* Active Project Breadcrumb / Command Bar */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.08] rounded-2xl transition-all">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView('projects')}
                  className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Tous les Projets</span>
                </button>
                <div className="h-4 w-px bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white max-w-[180px] sm:max-w-xs md:max-w-md truncate font-display">
                    {activeProject ? activeProject.title : 'Projet sans titre'}
                  </span>
                  {activeProject && (
                    <>
                      <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/25 text-[11px] font-mono font-bold">
                        {activeProject.format}
                      </span>
                      <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-white/[0.04] text-white/60 border border-white/[0.06] text-[11px]">
                        {activeProject.contentType}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeProject && (
                  <button
                    type="button"
                    onClick={() => handleOpenEditProject(activeProject)}
                    className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-white/60" />
                    <span>Modifier le projet</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveActiveProjectStoryboard}
                  disabled={isSavingProject}
                  className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingProject ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </button>
              </div>
            </div>
        
        {/* Hero Section & Studio Command Deck */}
        <section className="mb-12 sm:mb-16">
          <div className="relative rounded-3xl p-6 sm:p-10 md:p-12 overflow-hidden bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] shadow-2xl">
            {/* Background Ambient Glows */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto text-center">
              
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-white/80 backdrop-blur-md mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Format Vertical 9:16 • TikTok, Reels, Shorts</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight font-display text-white mb-4 leading-[1.08]">
                Transformez votre récit en <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                  Storyboard Cinématographique
                </span>
              </h1>

              <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
                L'IA analyse votre texte, découpe vos plans en séquences émotionnelles de 3 à 5 secondes, et prépare les prompts 9:16 et voix off de production.
              </p>

              {/* Inspiring Preset Story Chips */}
              <div className="mb-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center justify-center gap-1.5">
                  <Wand2 className="w-3 h-3 text-orange-400" /> Exemples inspirants en 1-clic :
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {PRESET_STORIES.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setNarration(preset.text)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-orange-500/15 border border-white/[0.08] hover:border-orange-500/40 text-xs font-medium text-white/80 hover:text-orange-300 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <span>{preset.title}</span>
                      <span className="text-[10px] text-white/40 font-mono">({preset.tag})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Prompt Deck Card */}
              <div className="bg-[#0b0c14] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl text-left">
                
                {/* Visual Style Selector */}
                <div className="mb-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-orange-400" /> Style Visuel & Photographique :
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {VISUAL_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedStyle(style)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                          selectedStyle.id === style.id
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 font-semibold'
                            : 'bg-white/[0.03] text-white/60 border-white/[0.08] hover:bg-white/[0.07] hover:text-white'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    placeholder="Collez ou écrivez votre voix off ici... Ex: La nuit tombait sur les toits humides de Paris. Une lueur dorée filtrait à travers les rideaux d'un atelier secret..."
                    className="w-full h-44 sm:h-48 bg-white/[0.02] border border-white/[0.08] focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 rounded-xl p-4 sm:p-5 text-sm sm:text-base text-white placeholder:text-white/20 transition-all resize-none outline-none font-sans leading-relaxed"
                  />
                  
                  {/* Textarea Bottom Tools */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 text-xs text-white/40 font-mono">
                      <span>{wordCount} mots</span>
                      <span>•</span>
                      <span>~{estimatedSeconds}s durée estimée</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {narration.trim() && (
                        <button
                          type="button"
                          onClick={() => setNarration('')}
                          className="px-3 py-2 text-xs text-white/40 hover:text-white/80 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                        >
                          Effacer
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={generateStoryboard}
                        disabled={isGenerating || !narration.trim()}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-white/10 disabled:to-white/10 disabled:text-white/25 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Découpage en cours...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Générer le Storyboard</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-center text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Director's Monitor while streaming generation */}
        <AnimatePresence>
          {isGenerating && (
            <DirectorMonitor
              streamingText={streamingText}
              modelName={GEMINI_MODEL}
            />
          )}
        </AnimatePresence>

        {/* Results & Storyboard Canvas */}
        <AnimatePresence>
          {storyboard && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Top Soundstage & CTA Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Music Ambiance card */}
                <div className="p-6 bg-[#0c0e18] border border-white/[0.08] rounded-2xl sm:rounded-3xl relative overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5 text-orange-400">
                      <Music className="w-5 h-5" />
                      <h3 className="font-bold text-xs uppercase tracking-wider">Ambiance Sonore Recommandée</h3>
                    </div>
                    {storyboard.ambianceAudioUrl ? (
                      <button
                        type="button"
                        onClick={() => downloadFile(storyboard.ambianceAudioUrl!, 'ambiance.mp3')}
                        className="text-[11px] font-bold text-white/50 hover:text-orange-400 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> MP3
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={generateAmbiance}
                        disabled={isGeneratingAmbiance}
                        className="px-3 py-1 bg-white/[0.05] hover:bg-orange-500 hover:text-white text-orange-400 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        {isGeneratingAmbiance ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>Générer Audio</span>
                      </button>
                    )}
                  </div>
                  <p className="text-base sm:text-lg font-light italic text-white/90 leading-snug">
                    "{storyboard.recommendedMusic}"
                  </p>
                  {storyboard.ambianceAudioUrl && (
                    <AudioPlayer
                      url={storyboard.ambianceAudioUrl}
                      filename="ambiance-cinematique.mp3"
                      label="Bande sonore suggérée"
                    />
                  )}
                </div>

                {/* Final Call to Action card */}
                <div className="p-6 bg-[#0c0e18] border border-white/[0.08] rounded-2xl sm:rounded-3xl shadow-lg flex flex-col justify-between">
                  <div className="flex items-center gap-2.5 mb-3 text-amber-400">
                    <MousePointerClick className="w-5 h-5" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">Appel à l'Action Final (CTA)</h3>
                  </div>
                  <p className="text-base sm:text-lg font-medium text-white/95 leading-snug">
                    "{storyboard.finalCTA}"
                  </p>
                  <div className="text-[11px] font-mono text-white/40 mt-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Optimisé pour la rétention et l'engagement TikTok / Reels</span>
                  </div>
                </div>
              </div>

              {/* Storyboard Timeline Ribbon */}
              <StoryboardOverview
                scenes={storyboard.scenes}
                onSelectScene={handleScrollToScene}
              />

              {/* Master Control Bar with Global Duration Slider */}
              <div 
                id="plans-sequences-master-bar"
                className="p-4 sm:p-5 bg-[#0b0c14] border border-white/[0.08] rounded-2xl sm:rounded-3xl shadow-xl space-y-4"
              >
                {/* Top Row: Title, Total Badge, and Batch Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                      Plans Séquences ({storyboard.scenes.length})
                    </h2>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/25 rounded-full text-xs font-mono text-orange-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Durée Totale : {activeTargetDuration}s</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Batch visuals */}
                    <button
                      type="button"
                      onClick={generatePreviews}
                      disabled={isGeneratingImages}
                      className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-orange-500/40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingImages ? <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" /> : <Sparkles className="w-3.5 h-3.5 text-orange-400" />}
                      <span>Tous les Visuels</span>
                    </button>

                    {/* Batch audio */}
                    <button
                      type="button"
                      onClick={generateVoiceovers}
                      disabled={isGeneratingAudio}
                      className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-orange-500/40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingAudio ? <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" /> : <Volume2 className="w-3.5 h-3.5 text-orange-400" />}
                      <span>Toutes les Voix</span>
                    </button>

                    {/* Add Scene */}
                    <button
                      type="button"
                      onClick={addScene}
                      className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Ajouter un plan supplémentaire"
                    >
                      <Plus className="w-3.5 h-3.5 text-orange-400" />
                      <span>Ajouter Scène</span>
                    </button>

                    {/* Export PDF */}
                    <button
                      type="button"
                      onClick={exportToPDF}
                      disabled={isExporting}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      <span>Exporter PDF</span>
                    </button>
                  </div>
                </div>

                {/* Global Scene Duration Adjuster (Slider) */}
                <div 
                  id="global-duration-slider-section"
                  className="pt-3.5 border-t border-white/[0.06] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white/[0.02] p-3.5 sm:p-4 rounded-xl border border-white/[0.04]"
                >
                  {/* Slider explanation & badge */}
                  <div className="flex items-center gap-3 min-w-[210px]">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                          Ajuster Durée Globale
                        </span>
                        <span className="text-[11px] font-mono text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20">
                          {activeTargetDuration}s
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-tight">
                        ~{(activeTargetDuration / (sceneCount || 1)).toFixed(1)}s en moyenne par plan • Ajuste tous les plans
                      </p>
                    </div>
                  </div>

                  {/* Range Slider Track */}
                  <div className="flex-1 flex items-center gap-3 max-w-xl">
                    <span className="text-xs font-mono text-white/40 w-7 text-right select-none">{minTotalDuration}s</span>
                    <div className="relative flex-1 flex items-center">
                      <input
                        id="global-video-duration-slider"
                        type="range"
                        min={minTotalDuration}
                        max={maxTotalDuration}
                        step={1}
                        value={activeTargetDuration}
                        onChange={(e) => handleGlobalDurationChange(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                        aria-label="Ajuster la durée totale de la vidéo"
                      />
                    </div>
                    <span className="text-xs font-mono text-white/40 w-7 select-none">{maxTotalDuration}s</span>

                    {/* Target Seconds Badge */}
                    <div className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black font-mono rounded-lg shadow-md shadow-orange-500/20 min-w-[44px] text-center select-none">
                      {activeTargetDuration}s
                    </div>
                  </div>

                  {/* Target Video Length Presets */}
                  {availablePresets.length > 0 && (
                    <div className="flex items-center gap-1.5 self-end lg:self-auto flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-white/40 mr-1 hidden sm:inline">Presets :</span>
                      {availablePresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          id={`preset-duration-${preset}s`}
                          onClick={() => handleGlobalDurationChange(preset)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                            activeTargetDuration === preset
                              ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/30 ring-1 ring-orange-400/50'
                              : 'bg-white/[0.04] text-white/60 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
                          }`}
                          title={`Ajuster la durée totale à ${preset} secondes`}
                        >
                          {preset}s
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Rendered Storyboard Cards */}
              <div ref={storyboardRef} className="space-y-6">
                {storyboard.scenes.map((scene, idx) => (
                  <div
                    key={scene.id || `scene-card-${idx}`}
                    ref={(el) => {
                      sceneElementsRef.current[idx] = el;
                    }}
                  >
                    <SceneCard
                      scene={scene}
                      index={idx}
                      totalScenes={storyboard.scenes.length}
                      isRegenerating={regeneratingImages.has(idx)}
                      isEditing={editingIdx === idx}
                      onMove={moveScene}
                      onDuplicate={duplicateScene}
                      onDelete={deleteScene}
                      onStartEdit={(i) => setEditingIdx(i)}
                      onSaveEdit={handleSaveScene}
                      onCancelEdit={() => setEditingIdx(null)}
                      onRegenerateImage={generateSinglePreview}
                      onOpenImageModal={(sc) => setSelectedModalScene(sc)}
                      onDownload={downloadFile}
                    />
                  </div>
                ))}
              </div>

            </motion.section>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!storyboard && !isGenerating && (
          <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/[0.06] rounded-3xl bg-white/[0.01]">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/20 mb-4">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-white mb-1.5">
              Prêt pour votre prochain court-métrage ou vidéo virale ?
            </h3>
            <p className="text-white/40 text-xs sm:text-sm max-w-md">
              Choisissez l'un des exemples ci-dessus ou collez votre script pour lancer le réalisateur IA.
            </p>
          </div>
        )}
          </>
        )}

      </main>

      {/* Fullscreen Image Lightbox Modal */}
      {selectedModalScene && (
        <ImageModal
          scene={selectedModalScene}
          totalScenes={storyboard?.scenes.length || 0}
          onClose={() => setSelectedModalScene(null)}
          onPrev={() => {
            if (!storyboard) return;
            const curIdx = storyboard.scenes.findIndex(s => s.number === selectedModalScene.number);
            if (curIdx > 0) setSelectedModalScene(storyboard.scenes[curIdx - 1]);
          }}
          onNext={() => {
            if (!storyboard) return;
            const curIdx = storyboard.scenes.findIndex(s => s.number === selectedModalScene.number);
            if (curIdx < storyboard.scenes.length - 1) setSelectedModalScene(storyboard.scenes[curIdx + 1]);
          }}
          onDownload={downloadFile}
        />
      )}

      {/* Project Create / Edit Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        mode={projectModalMode}
        initialData={projectToEdit || undefined}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProjectForm}
      />

      {/* Delete Project Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        projectTitle={projectToDelete?.title || ''}
        isDeleting={isDeleting}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl backdrop-blur-md border ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-200 shadow-rose-950/40'
                : toastMessage.type === 'info'
                ? 'bg-slate-900/90 border-cyan-500/30 text-cyan-200 shadow-cyan-950/40'
                : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200 shadow-emerald-950/40'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Studio Footer */}
      <footer className="py-8 border-t border-white/[0.06] bg-[#05060a] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
              AI
            </div>
            <span className="text-xs font-bold tracking-tight text-white/80 font-display uppercase">
              AI Director Studio • 9:16 Vertical Engine
            </span>
          </div>
          <p className="text-white/30 text-xs font-mono">
            Powered by Gemini 3.1 Pro & 2.5 Flash
          </p>
        </div>
      </footer>

    </div>
  );
}
