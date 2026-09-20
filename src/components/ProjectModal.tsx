import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Loader2, 
  Sparkles, 
  Film, 
  BookOpen, 
  Zap, 
  Flame, 
  PlayCircle, 
  Megaphone, 
  Compass, 
  Music, 
  Smartphone, 
  Monitor, 
  Square, 
  Globe, 
  Palette, 
  Info,
  FolderPlus,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ProjectFormData, ContentType, AspectRatio, ProjectLanguage } from '../types';
import { CONTENT_TYPE_OPTIONS, FORMAT_OPTIONS, LANGUAGE_OPTIONS } from '../data/projectDefinitions';
import { VISUAL_STYLES } from '../data/presets';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => Promise<void>;
  initialProject?: Project | null;
  mode: 'create' | 'edit';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
  mode
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>('tiktok');
  const [format, setFormat] = useState<AspectRatio>('9:16');
  const [language, setLanguage] = useState<ProjectLanguage>('fr');
  const [visualStyleId, setVisualStyleId] = useState('cinematic-35mm');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form data
  useEffect(() => {
    if (initialProject && mode === 'edit') {
      setTitle(initialProject.title);
      setDescription(initialProject.description || '');
      setContentType(initialProject.contentType);
      setFormat(initialProject.format);
      setLanguage(initialProject.language);
      setVisualStyleId(initialProject.visualStyleId);
    } else {
      setTitle('');
      setDescription('');
      setContentType('tiktok');
      setFormat('9:16');
      setLanguage('fr');
      setVisualStyleId('cinematic-35mm');
    }
    setErrors({});
  }, [initialProject, mode, isOpen]);

  // When user changes content type, adapt default suggested format if user hasn't explicitly customized yet
  const handleContentTypeSelect = (typeId: ContentType) => {
    setContentType(typeId);
    const selectedDef = CONTENT_TYPE_OPTIONS.find(c => c.id === typeId);
    if (selectedDef && mode === 'create') {
      setFormat(selectedDef.defaultFormat);
    }
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) {
      errs.title = 'Veuillez saisir un titre pour votre projet.';
    } else if (title.trim().length < 2) {
      errs.title = 'Le titre doit comporter au moins 2 caractères.';
    } else if (title.trim().length > 100) {
      errs.title = 'Le titre ne peut pas dépasser 100 caractères.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        contentType,
        format,
        language,
        visualStyleId
      });
      onClose();
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Erreur lors de l’enregistrement.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render icon component dynamically
  const renderContentTypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Film': return <Film className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'PlayCircle': return <PlayCircle className="w-4 h-4" />;
      case 'Megaphone': return <Megaphone className="w-4 h-4" />;
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Music': return <Music className="w-4 h-4" />;
      default: return <Film className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="project-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl bg-[#0e101a] border border-white/[0.12] rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/80 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              {mode === 'create' ? <FolderPlus className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                {mode === 'create' ? 'Créer un Nouveau Projet' : 'Modifier les Paramètres du Projet'}
              </h2>
              <p className="text-xs text-white/50">
                {mode === 'create' 
                  ? 'Configurez le type, le format et l’esthétique cinématographique de votre production.' 
                  : 'Ajustez les métadonnées et la direction artistique du projet.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-6 text-slate-200">
          
          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* 1. Titre & Description */}
          <div className="space-y-4">
            <div>
              <label htmlFor="project-title-input" className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-1.5">
                Titre du Projet <span className="text-orange-400">*</span>
              </label>
              <input
                id="project-title-input"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                }}
                placeholder="Ex: Mystère Nocturne - Épisode 1, Publicité Parfum Éternel..."
                className={`w-full px-4 py-2.5 bg-white/[0.04] border ${
                  errors.title ? 'border-rose-500/80 focus:ring-rose-500/30' : 'border-white/[0.1] focus:border-orange-500/60 focus:ring-orange-500/20'
                } rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all`}
                autoFocus
              />
              {errors.title && (
                <p className="mt-1 text-xs text-rose-400">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="project-desc-input" className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-1.5">
                Description / Synopsis <span className="text-white/40 font-normal">(optionnel)</span>
              </label>
              <textarea
                id="project-desc-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Résumé de l’intrigue, notes de production, cible éditoriale ou directives spécifiques..."
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
              />
            </div>
          </div>

          {/* 2. Type de Contenu (9 types demandés) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white/80">
                Type de Contenu <span className="text-orange-400">*</span>
              </label>
              <span className="text-[11px] text-white/40">9 formats spécialisés</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CONTENT_TYPE_OPTIONS.map((item) => {
                const isSelected = contentType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    id={`content-type-${item.id}`}
                    onClick={() => handleContentTypeSelect(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500 text-white shadow-md shadow-orange-500/15 ring-1 ring-orange-500/40'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-orange-500 text-white' : 'bg-white/[0.06] text-white/70'}`}>
                        {renderContentTypeIcon(item.iconName)}
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-orange-500/20 text-orange-300' : 'bg-white/[0.05] text-white/40'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <p className="text-[10px] text-white/50 line-clamp-1 mt-0.5">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Format Vidéo (9:16, 16:9, 1:1) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/80 block">
              Format d’Image (Ratio) <span className="text-orange-400">*</span>
            </label>

            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((fmt) => {
                const isSelected = format === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    id={`format-option-${fmt.id.replace(':', '-')}`}
                    onClick={() => setFormat(fmt.id)}
                    className={`p-3 sm:p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500 text-white shadow-md shadow-orange-500/15 ring-1 ring-orange-500/40'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white'
                    }`}
                  >
                    {/* Visual Ratio Box */}
                    <div className="h-12 w-full flex items-center justify-center">
                      {fmt.id === '9:16' && (
                        <div className={`w-6 h-10 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-orange-400 bg-orange-500/20' : 'border-white/40 bg-white/5'
                        }`}>
                          <Smartphone className="w-3.5 h-3.5 text-current opacity-80" />
                        </div>
                      )}
                      {fmt.id === '16:9' && (
                        <div className={`w-12 h-7 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-orange-400 bg-orange-500/20' : 'border-white/40 bg-white/5'
                        }`}>
                          <Monitor className="w-3.5 h-3.5 text-current opacity-80" />
                        </div>
                      )}
                      {fmt.id === '1:1' && (
                        <div className={`w-8 h-8 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-orange-400 bg-orange-500/20' : 'border-white/40 bg-white/5'
                        }`}>
                          <Square className="w-3.5 h-3.5 text-current opacity-80" />
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-bold block">{fmt.label}</span>
                      <span className="text-[10px] text-white/50 block">{fmt.sublabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Langue & Direction Artistique (Style Visuel) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Langue */}
            <div>
              <label htmlFor="project-language-select" className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span>Langue de la Voix Off</span>
              </label>
              <select
                id="project-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as ProjectLanguage)}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-[#0e101a] text-white">
                    {lang.flag} {lang.label} ({lang.nativeLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* Style Visuel */}
            <div>
              <label htmlFor="project-style-select" className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-orange-400" />
                <span>Style Visuel (DA)</span>
              </label>
              <select
                id="project-style-select"
                value={visualStyleId}
                onChange={(e) => setVisualStyleId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
              >
                {VISUAL_STYLES.map((st) => (
                  <option key={st.id} value={st.id} className="bg-[#0e101a] text-white">
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-5 sm:px-7 py-4 border-t border-white/[0.08] bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{mode === 'create' ? 'Créer le Projet' : 'Enregistrer les Modifications'}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
