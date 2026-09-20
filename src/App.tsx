/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Clapperboard, 
  Send, 
  Loader2, 
  Film, 
  Music, 
  MousePointerClick, 
  Camera, 
  Clock, 
  Smile, 
  Type as TypeIcon,
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  Download,
  Play,
  Pause,
  Volume2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from "jspdf";
import { domToPng } from "modern-screenshot";

// --- Types ---

interface Scene {
  id?: string;
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

interface Storyboard {
  scenes: Scene[];
  recommendedMusic: string;
  finalCTA: string;
  ambianceAudioUrl?: string;
}

// --- Constants ---

const GEMINI_MODEL = "gemini-3.1-pro-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

// --- Components ---

const SceneAudioPlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-4 p-3 bg-white/5 border border-white/10 rounded-xl group/audio transition-all hover:bg-white/10">
      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center bg-orange-500 rounded-full text-white shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden relative">
        <div 
          style={{ width: `${progress}%` }}
          className="h-full bg-orange-500 transition-all duration-100"
        />
      </div>
      <Volume2 className="w-4 h-4 text-white/20 group-hover/audio:text-orange-500 transition-colors" />
      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
        className="hidden"
      />
    </div>
  );
};

export default function App() {
  const [narration, setNarration] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingAmbiance, setIsGeneratingAmbiance] = useState(false);
  const [regeneratingImages, setRegeneratingImages] = useState<Set<number>>(new Set());
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Scene>>({});
  const [isExporting, setIsExporting] = useState(false);
  const storyboardRef = React.useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const generateSinglePreview = async (idx: number) => {
    if (!storyboard) return;
    
    setRegeneratingImages(prev => new Set(prev).add(idx));
    
    try {
      const scene = storyboard.scenes[idx];
      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: [{ parts: [{ text: `Cinematic vertical 9:16 shot, high quality, professional lighting, emotional atmosphere. Scene description: ${scene.imagePrompt}` }] }],
        config: {
          imageConfig: {
            aspectRatio: "9:16"
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
      }
    } catch (err) {
      console.error(`Failed to regenerate image for scene ${idx + 1}`, err);
    } finally {
      setRegeneratingImages(prev => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  };

  const handleEditScene = (idx: number, scene: Scene) => {
    setEditingIdx(idx);
    setEditForm({ ...scene });
  };

  const handleSaveScene = (idx: number) => {
    if (!storyboard) return;
    const updatedScenes = [...storyboard.scenes];
    updatedScenes[idx] = { ...updatedScenes[idx], ...editForm } as Scene;
    setStoryboard({ ...storyboard, scenes: updatedScenes });
    setEditingIdx(null);
  };

  const moveScene = (index: number, direction: 'up' | 'down') => {
    if (!storyboard) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= storyboard.scenes.length) return;

    const newScenes = [...storyboard.scenes];
    const [movedScene] = newScenes.splice(index, 1);
    newScenes.splice(targetIndex, 0, movedScene);

    // Renumber scenes sequentially so the number matches the chronological timeline
    const renumberedScenes = newScenes.map((sc, i) => ({
      ...sc,
      number: i + 1,
    }));

    setStoryboard({
      ...storyboard,
      scenes: renumberedScenes,
    });

    // Remap regenerating images indices if an image is currently in flight
    if (regeneratingImages.size > 0) {
      setRegeneratingImages(prev => {
        const next = new Set<number>();
        prev.forEach(i => {
          if (i === index) {
            next.add(targetIndex);
          } else if (i === targetIndex) {
            next.add(index);
          } else {
            next.add(i);
          }
        });
        return next;
      });
    }

    // Keep active editing on the same scene if user moves it while editing
    if (editingIdx === index) {
      setEditingIdx(targetIndex);
    } else if (editingIdx === targetIndex) {
      setEditingIdx(index);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateStoryboard = async () => {
    if (!narration.trim()) return;

    setIsGenerating(true);
    setStreamingText('');
    setError(null);
    setStoryboard(null);

    try {
      const responseStream = await ai.models.generateContentStream({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [{ text: `Tu es un réalisateur IA spécialisé dans la création de vidéos courtes cinématographiques pour les réseaux sociaux.
            Ta mission est de transformer la narration suivante en un storyboard complet pour une vidéo verticale (9:16) de 30 secondes.
            
            Narration: "${narration}"
            
            Instructions:
            1. Découpe l’histoire en scènes de 3-4 secondes.
            2. Maintiens une cohérence visuelle.
            3. Le ton doit être émotionnel, immersif et mystérieux.
            
            Réponds UNIQUEMENT au format JSON avec la structure suivante:
            {
              "scenes": [
                {
                  "number": number,
                  "voiceover": "phrase de la voix off",
                  "visualDescription": "description visuelle détaillée",
                  "imagePrompt": "prompt détaillé en anglais pour un générateur d'image (style cinématographique, 9:16)",
                  "onScreenText": "texte à afficher",
                  "emotion": "émotion/atmosphère",
                  "cameraMovement": "mouvement recommandé",
                  "duration": "durée estimée"
                }
              ],
              "recommendedMusic": "type de musique",
              "finalCTA": "appel à l'action final"
            }` }]
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
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la génération du storyboard. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
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
          contents: [{ parts: [{ text: `Dis de manière cinématographique et émotionnelle : ${scene.voiceover}` }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' } // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
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

  const exportToPDF = async () => {
    if (!storyboardRef.current || !storyboard) return;
    setIsExporting(true);

    try {
      // modern-screenshot handles modern CSS like oklch/oklab better than html2canvas
      const imgData = await domToPng(storyboardRef.current, {
        scale: 2,
        backgroundColor: "#050505",
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
      pdf.save(`storyboard-${Date.now()}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
      setError("Erreur lors de l'exportation du PDF. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
      {/* Hero Section */}
      <header className="relative h-[60vh] flex flex-col items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
          <img 
            src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=2000" 
            alt="Cinematic Background" 
            className="w-full h-full object-cover opacity-40 grayscale"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase border border-white/20 rounded-full bg-white/5 backdrop-blur-sm">
                AI Director Pro
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-8 italic font-display">
              Storyboard <br />
              <span className="text-orange-500">Cinématographique</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
              Transformez vos récits en visions visuelles et sonores. L'IA analyse votre narration pour créer un découpage technique prêt pour la production.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* Input Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clapperboard className="w-6 h-6 text-orange-500" />
                Narration
              </h2>
              <p className="text-white/40 text-sm leading-relaxed">
                Collez votre voix off ou votre histoire ici. L'IA s'occupera de la découper en scènes émotionnelles et de générer les prompts visuels et les voix off.
              </p>
            </div>
            <div className="lg:col-span-8">
              <div className="relative group">
                <textarea
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="Il était une fois, dans le silence d'une ville endormie..."
                  className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-lg focus:outline-none focus:border-orange-500/50 transition-all resize-none placeholder:text-white/10"
                />
                <button
                  onClick={generateStoryboard}
                  disabled={isGenerating || !narration.trim()}
                  className="absolute bottom-6 right-6 px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-white/10 disabled:text-white/20 rounded-full font-bold flex items-center gap-2 transition-all active:scale-95 z-20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Générer le Storyboard
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-10 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Director's Monitor (Streaming Flow) */}
        <AnimatePresence>
          {isGenerating && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-20"
            >
              <div className="bg-[#0a0a0a] border border-orange-500/30 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.1)]">
                <div className="bg-orange-500/10 border-b border-orange-500/20 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">Live Analysis Monitor</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                  </div>
                </div>
                <div className="p-8 font-mono text-xs text-orange-500/60 leading-relaxed h-64 overflow-y-auto scrollbar-hide">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white/40">
                      <span className="text-orange-500/40">[{new Date().toLocaleTimeString()}]</span>
                      <span>Initializing neural storyboard engine...</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                      <span className="text-orange-500/40">[{new Date().toLocaleTimeString()}]</span>
                      <span>Analyzing narrative emotional weight...</span>
                    </div>
                    <div className="mt-4 text-orange-500/90 whitespace-pre-wrap break-all">
                      {streamingText || "Waiting for stream data..."}
                    </div>
                    <motion.div 
                      animate={{ opacity: [0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="w-2 h-4 bg-orange-500/50 inline-block align-middle"
                    />
                  </div>
                </div>
                <div className="bg-orange-500/5 px-6 py-2 border-t border-orange-500/10 flex items-center justify-between">
                  <span className="text-[8px] uppercase tracking-widest text-white/20">Stream Status: Active</span>
                  <span className="text-[8px] uppercase tracking-widest text-white/20">Model: {GEMINI_MODEL}</span>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {storyboard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-20"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl relative group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-orange-500">
                      <Music className="w-6 h-6" />
                      <h3 className="font-bold uppercase tracking-wider text-xs">Ambiance Sonore</h3>
                    </div>
                    {storyboard.ambianceAudioUrl ? (
                      <button 
                        onClick={() => downloadFile(storyboard.ambianceAudioUrl!, 'ambiance.mp3')}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/20 hover:text-orange-500 transition-colors"
                      >
                        <Download className="w-4 h-4" /> Télécharger MP3
                      </button>
                    ) : (
                      <button 
                        onClick={generateAmbiance}
                        disabled={isGeneratingAmbiance}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/20 hover:text-orange-500 transition-colors disabled:opacity-50"
                      >
                        {isGeneratingAmbiance ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Sparkles className="w-3 h-3" /> Générer MP3</>}
                      </button>
                    )}
                  </div>
                  <p className="text-xl font-light italic text-white/80">"{storyboard.recommendedMusic}"</p>
                  {storyboard.ambianceAudioUrl && (
                    <SceneAudioPlayer url={storyboard.ambianceAudioUrl} />
                  )}
                </div>
                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-4 text-orange-500">
                    <MousePointerClick className="w-6 h-6" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Appel à l'Action</h3>
                  </div>
                  <p className="text-xl font-light italic text-white/80">"{storyboard.finalCTA}"</p>
                </div>
              </div>

              {/* Scenes Grid */}
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter font-display">
                    Scénario <span className="text-orange-500">Détaillé</span>
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={generatePreviews}
                      disabled={isGeneratingImages}
                      className="flex items-center gap-2 px-6 py-2 border border-white/20 rounded-full hover:bg-white/5 transition-all disabled:opacity-50 text-xs font-bold uppercase tracking-widest"
                    >
                      {isGeneratingImages ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-orange-500" />
                      )}
                      Visuels
                    </button>
                    <button
                      onClick={generateVoiceovers}
                      disabled={isGeneratingAudio}
                      className="flex items-center gap-2 px-6 py-2 border border-white/20 rounded-full hover:bg-white/5 transition-all disabled:opacity-50 text-xs font-bold uppercase tracking-widest"
                    >
                      {isGeneratingAudio ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Music className="w-4 h-4 text-orange-500" />
                      )}
                      Voix Off
                    </button>
                    <button
                      onClick={exportToPDF}
                      disabled={isExporting}
                      className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all disabled:opacity-50 text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20"
                    >
                      {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Exporter PDF
                    </button>
                  </div>
                </div>

                <div ref={storyboardRef} className="grid grid-cols-1 gap-12 p-4">
                  {storyboard.scenes.map((scene, idx) => (
                    <motion.div
                      key={scene.id || `scene-${idx}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
                      className="group grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/[0.07] transition-all"
                    >
                      {/* Visual Preview */}
                      <div className="lg:col-span-4 aspect-[9/16] bg-black rounded-2xl overflow-hidden relative border border-white/10 group/img">
                        {regeneratingImages.has(idx) ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 animate-pulse">
                            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500/50">Régénération...</span>
                          </div>
                        ) : scene.previewUrl ? (
                          <>
                            <img 
                              src={scene.previewUrl} 
                              alt={`Scene ${scene.number}`} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <button 
                                onClick={() => downloadFile(scene.previewUrl!, `scene-${scene.number}.png`)}
                                className="p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-orange-500 transition-colors"
                                title="Télécharger l'image"
                              >
                                <ImageIcon className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => generateSinglePreview(idx)}
                                className="p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-orange-500 transition-colors"
                                title="Régénérer l'image"
                              >
                                <Sparkles className="w-5 h-5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-4">
                            <ImageIcon className="w-12 h-12" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Aperçu Visuel</span>
                            <button 
                              onClick={() => generateSinglePreview(idx)}
                              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-orange-500 transition-all border border-white/10"
                            >
                              Générer
                            </button>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-xl shadow-2xl">
                            {scene.number}
                          </div>
                          <div className="flex flex-col gap-0.5 bg-black/60 backdrop-blur-md rounded-lg p-0.5 border border-white/10 shadow-lg">
                            <button
                              type="button"
                              onClick={() => moveScene(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 hover:bg-orange-500 rounded text-white/70 hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white/70 cursor-pointer disabled:cursor-not-allowed"
                              title="Monter la scène"
                              aria-label="Monter la scène"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveScene(idx, 'down')}
                              disabled={idx === storyboard.scenes.length - 1}
                              className="p-1 hover:bg-orange-500 rounded text-white/70 hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-white/70 cursor-pointer disabled:cursor-not-allowed"
                              title="Descendre la scène"
                              aria-label="Descendre la scène"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Scene Details */}
                      <div className="lg:col-span-8 flex flex-col justify-between py-2">
                        {editingIdx === idx ? (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Mode Édition</span>
                                <span className="text-xs text-white/40">• Scène {scene.number} sur {storyboard.scenes.length}</span>
                              </div>
                              <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-0.5">
                                <button
                                  type="button"
                                  onClick={() => moveScene(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-orange-500 disabled:opacity-20 disabled:hover:text-white/40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                  title="Monter la scène"
                                  aria-label="Monter la scène"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveScene(idx, 'down')}
                                  disabled={idx === storyboard.scenes.length - 1}
                                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-orange-500 disabled:opacity-20 disabled:hover:text-white/40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                  title="Descendre la scène"
                                  aria-label="Descendre la scène"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Durée</label>
                                <input 
                                  type="text" 
                                  value={editForm.duration || ''} 
                                  onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-orange-500/50 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Émotion</label>
                                <input 
                                  type="text" 
                                  value={editForm.emotion || ''} 
                                  onChange={(e) => setEditForm({ ...editForm, emotion: e.target.value })}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-orange-500/50 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Caméra</label>
                                <input 
                                  type="text" 
                                  value={editForm.cameraMovement || ''} 
                                  onChange={(e) => setEditForm({ ...editForm, cameraMovement: e.target.value })}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-orange-500/50 outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-1 block">Voix Off</label>
                              <textarea 
                                value={editForm.voiceover || ''} 
                                onChange={(e) => setEditForm({ ...editForm, voiceover: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500/50 outline-none h-20 resize-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Description Visuelle</label>
                              <textarea 
                                value={editForm.visualDescription || ''} 
                                onChange={(e) => setEditForm({ ...editForm, visualDescription: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500/50 outline-none h-20 resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Texte Écran</label>
                                <input 
                                  type="text" 
                                  value={editForm.onScreenText || ''} 
                                  onChange={(e) => setEditForm({ ...editForm, onScreenText: e.target.value })}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-orange-500/50 outline-none"
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <button 
                                  onClick={() => handleSaveScene(idx)}
                                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase py-2 rounded-lg transition-colors"
                                >
                                  Enregistrer
                                </button>
                                <button 
                                  onClick={() => setEditingIdx(null)}
                                  className="px-4 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase py-2 rounded-lg transition-colors border border-white/10"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                              <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  {scene.duration}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                  <Smile className="w-3 h-3 text-orange-500" />
                                  {scene.emotion}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                  <Camera className="w-3 h-3 text-orange-500" />
                                  {scene.cameraMovement}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1">
                                  <button
                                    type="button"
                                    onClick={() => moveScene(idx, 'up')}
                                    disabled={idx === 0}
                                    className="p-1.5 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-orange-500 disabled:opacity-20 disabled:hover:text-white/40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                    title="Monter la scène"
                                    aria-label="Monter la scène"
                                  >
                                    <ArrowUp className="w-4 h-4" />
                                  </button>
                                  <span className="text-[10px] font-mono text-white/30 px-1 font-semibold">
                                    {scene.number}/{storyboard.scenes.length}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => moveScene(idx, 'down')}
                                    disabled={idx === storyboard.scenes.length - 1}
                                    className="p-1.5 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-orange-500 disabled:opacity-20 disabled:hover:text-white/40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                    title="Descendre la scène"
                                    aria-label="Descendre la scène"
                                  >
                                    <ArrowDown className="w-4 h-4" />
                                  </button>
                                </div>
                                <button 
                                  onClick={() => handleEditScene(idx, scene)}
                                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/20 hover:text-orange-500"
                                  title="Modifier la scène"
                                >
                                  <Clapperboard className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-8">
                              <section>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">Voix Off</h4>
                                  {scene.audioUrl && (
                                    <button 
                                      onClick={() => downloadFile(scene.audioUrl!, `voiceover-${scene.number}.mp3`)}
                                      className="text-[10px] uppercase tracking-widest font-bold text-white/20 hover:text-orange-500 transition-colors flex items-center gap-1"
                                    >
                                      <Download className="w-3 h-3" /> Télécharger MP3
                                    </button>
                                  )}
                                </div>
                                <p className="text-2xl font-medium leading-tight">"{scene.voiceover}"</p>
                                {scene.audioUrl && (
                                  <SceneAudioPlayer url={scene.audioUrl} />
                                )}
                              </section>

                              <section>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Description Visuelle</h4>
                                <p className="text-white/70 leading-relaxed">{scene.visualDescription}</p>
                              </section>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                <section>
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 flex items-center gap-2">
                                    <TypeIcon className="w-3 h-3" /> Texte à l'écran
                                  </h4>
                                  <p className="text-sm font-mono text-orange-500/80">{scene.onScreenText || "—"}</p>
                                </section>
                                <section>
                                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><Sparkles className="w-3 h-3" /> Prompt IA</span>
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(scene.imagePrompt)}
                                      className="hover:text-orange-500 transition-colors"
                                      title="Copier le prompt"
                                    >
                                      <MousePointerClick className="w-3 h-3" />
                                    </button>
                                  </h4>
                                  <p className="text-[10px] font-mono text-white/30 line-clamp-2 italic">{scene.imagePrompt}</p>
                                </section>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!storyboard && !isGenerating && (
          <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <Film className="w-16 h-16 text-white/10 mb-6" />
            <h3 className="text-xl font-bold mb-2">Prêt pour votre prochain chef-d'œuvre ?</h3>
            <p className="text-white/30 max-w-sm">
              Entrez votre narration ci-dessus pour commencer la création de votre storyboard.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/10 mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-black">AI</div>
            <span className="font-bold tracking-tighter uppercase">Director Pro</span>
          </div>
          <p className="text-white/20 text-xs tracking-widest uppercase">
            © 2026 AI Studio Build • Cinematic Storytelling Engine
          </p>
        </div>
      </footer>
    </div>
  );
}
