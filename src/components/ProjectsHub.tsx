import React, { useState, useMemo } from 'react';
import { 
  FolderPlus, 
  Search, 
  Filter, 
  Film, 
  Clock, 
  Sparkles, 
  Copy, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Play, 
  Smartphone, 
  Monitor, 
  Square,
  BookOpen,
  Zap,
  Flame,
  PlayCircle,
  Megaphone,
  Compass,
  Music,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ContentType, AspectRatio } from '../types';
import { CONTENT_TYPE_OPTIONS, FORMAT_OPTIONS, LANGUAGE_OPTIONS } from '../data/projectDefinitions';
import { VISUAL_STYLES } from '../data/presets';

interface ProjectsHubProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDuplicateProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export const ProjectsHub: React.FC<ProjectsHubProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onEditProject,
  onDuplicateProject,
  onDeleteProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        proj.title.toLowerCase().includes(q) || 
        (proj.description && proj.description.toLowerCase().includes(q));

      // Content Type
      const matchesType = selectedContentType === 'all' || proj.contentType === selectedContentType;

      // Format
      const matchesFormat = selectedFormat === 'all' || proj.format === selectedFormat;

      return matchesSearch && matchesType && matchesFormat;
    });
  }, [projects, searchQuery, selectedContentType, selectedFormat]);

  // Quick stats
  const totalScenes = projects.reduce((acc, p) => acc + (p.storyboard?.scenes?.length || 0), 0);
  const totalDurationSeconds = projects.reduce((acc, p) => {
    if (!p.storyboard?.scenes) return acc;
    const dur = p.storyboard.scenes.reduce((sum, sc) => {
      const match = sc.duration?.match(/\d+(\.\d+)?/);
      return sum + (match ? parseFloat(match[0]) : 4);
    }, 0);
    return acc + Math.round(dur);
  }, 0);

  // Helper for content type label and icon
  const getContentTypeInfo = (typeId: ContentType) => {
    return CONTENT_TYPE_OPTIONS.find(c => c.id === typeId) || {
      label: typeId,
      badge: 'Vidéo',
      iconName: 'Film'
    };
  };

  const getLanguageInfo = (langId: string) => {
    return LANGUAGE_OPTIONS.find(l => l.id === langId) || { label: langId, flag: '🌐' };
  };

  const getVisualStyleLabel = (styleId: string) => {
    return VISUAL_STYLES.find(s => s.id === styleId)?.label || 'Cinématographique';
  };

  const renderTypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Film': return <Film className="w-3.5 h-3.5" />;
      case 'BookOpen': return <BookOpen className="w-3.5 h-3.5" />;
      case 'Zap': return <Zap className="w-3.5 h-3.5" />;
      case 'Flame': return <Flame className="w-3.5 h-3.5" />;
      case 'PlayCircle': return <PlayCircle className="w-3.5 h-3.5" />;
      case 'Megaphone': return <Megaphone className="w-3.5 h-3.5" />;
      case 'Compass': return <Compass className="w-3.5 h-3.5" />;
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5" />;
      case 'Music': return <Music className="w-3.5 h-3.5" />;
      default: return <Film className="w-3.5 h-3.5" />;
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return 'Récemment';
    }
  };

  return (
    <div id="projects-hub-container" className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-[#0d0f1a] to-[#121524] border border-white/[0.08] rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold uppercase tracking-wider rounded-md">
              Gestionnaire de Projets
            </span>
            <span className="text-xs text-white/40">Base de données persistante</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
            Mes Projets Cinématographiques
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-xl">
            Créez, scénarisez, personnalisez le format (9:16, 16:9, 1:1) et gérez vos productions avec découpage de scènes IA.
          </p>
        </div>

        {/* Action Button & Quick Counters */}
        <div className="flex flex-wrap items-center gap-3 z-10 self-stretch md:self-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-3.5 py-2 rounded-xl text-xs font-mono text-white/70">
            <div>
              <span className="text-white font-bold text-sm block leading-none">{projects.length}</span>
              <span className="text-[10px] text-white/40">Projets</span>
            </div>
            <div className="h-6 w-px bg-white/10 mx-1" />
            <div>
              <span className="text-orange-400 font-bold text-sm block leading-none">{totalScenes}</span>
              <span className="text-[10px] text-white/40">Plans</span>
            </div>
            <div className="h-6 w-px bg-white/10 mx-1" />
            <div>
              <span className="text-amber-400 font-bold text-sm block leading-none">{totalDurationSeconds}s</span>
              <span className="text-[10px] text-white/40">Durée</span>
            </div>
          </div>

          <button
            type="button"
            id="btn-create-project-hub"
            onClick={onCreateProject}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Projet</span>
          </button>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-[#0b0c14] border border-white/[0.08] rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre ou description..."
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-all"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content Type Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Filter className="w-3.5 h-3.5" />
            <span>Type :</span>
          </div>
          <select
            value={selectedContentType}
            onChange={(e) => setSelectedContentType(e.target.value)}
            className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-orange-500/60 cursor-pointer"
          >
            <option value="all" className="bg-[#0e101a] text-white">Tous les types ({projects.length})</option>
            {CONTENT_TYPE_OPTIONS.map((item) => (
              <option key={item.id} value={item.id} className="bg-[#0e101a] text-white">
                {item.label}
              </option>
            ))}
          </select>

          {/* Format Filter Pills */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setSelectedFormat('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFormat === 'all'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setSelectedFormat('9:16')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedFormat === '9:16'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>9:16</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFormat('16:9')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedFormat === '16:9'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>16:9</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFormat('1:1')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedFormat === '1:1'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Square className="w-3 h-3" />
              <span>1:1</span>
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#0b0c14] border border-white/[0.08] rounded-3xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <FolderPlus className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-white">Aucun projet trouvé</h3>
            <p className="text-xs text-white/50">
              {searchQuery || selectedContentType !== 'all' || selectedFormat !== 'all'
                ? 'Aucun projet ne correspond à vos filtres de recherche actuels.'
                : 'Commencez par créer votre premier projet de production cinématographique !'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateProject}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
          >
            Créer un Projet Maintenant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isActive = project.id === activeProjectId;
            const typeInfo = getContentTypeInfo(project.contentType);
            const langInfo = getLanguageInfo(project.language);
            const styleLabel = getVisualStyleLabel(project.visualStyleId);
            const sceneCount = project.storyboard?.scenes?.length || 0;

            // Compute duration
            const durationSec = project.storyboard?.scenes?.reduce((acc, sc) => {
              const match = sc.duration?.match(/\d+(\.\d+)?/);
              return acc + (match ? parseFloat(match[0]) : 4);
            }, 0) || project.targetTotalDuration || 30;

            return (
              <motion.div
                key={project.id}
                id={`project-card-${project.id}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-[#0d0e17] border rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden ${
                  isActive 
                    ? 'border-orange-500/60 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/30' 
                    : 'border-white/[0.08] hover:border-white/[0.18] hover:bg-[#10121e]'
                }`}
              >
                {/* Card Top: Badges & Format */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Content Type Badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-400 text-[11px] font-bold">
                        {renderTypeIcon(typeInfo.iconName)}
                        <span>{typeInfo.label}</span>
                      </span>

                      {/* Format Badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/80 text-[11px] font-mono font-bold">
                        {project.format === '9:16' && <Smartphone className="w-3 h-3 text-orange-400" />}
                        {project.format === '16:9' && <Monitor className="w-3 h-3 text-amber-400" />}
                        {project.format === '1:1' && <Square className="w-3 h-3 text-sky-400" />}
                        <span>{project.format}</span>
                      </span>

                      {/* Language Badge */}
                      <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] text-xs" title={`Langue : ${langInfo.label}`}>
                        {langInfo.flag}
                      </span>
                    </div>

                    {/* Active Studio Indicator */}
                    {isActive && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider rounded-md animate-pulse">
                        En cours
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-orange-300 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-white/50 line-clamp-2 mt-1 min-h-[32px]">
                      {project.description || 'Aucune description rédigée pour ce projet.'}
                    </p>
                  </div>
                </div>

                {/* Card Middle: Metadata & Visual Style */}
                <div className="py-3 my-3 border-y border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="text-[11px] text-white/40">Direction Artistique :</span>
                    <span className="font-medium text-white/80 text-[11px] line-clamp-1 max-w-[170px] text-right">
                      {styleLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-white/60">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Layers className="w-3.5 h-3.5 text-orange-400" />
                      <span>{sceneCount} plans</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{Math.round(durationSec)}s</span>
                    </span>
                    <span className="text-[10px] text-white/40">
                      {formatDate(project.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Primary & Secondary Actions */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  {/* Open in Studio Button */}
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 hover:bg-orange-600'
                        : 'bg-white/[0.06] hover:bg-orange-500 hover:text-white text-white/80'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isActive ? 'Reprendre Studio' : 'Ouvrir Studio'}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    id={`edit-btn-${project.id}`}
                    onClick={() => onEditProject(project)}
                    className="p-2 text-white/50 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all cursor-pointer"
                    title="Modifier les paramètres du projet"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Duplicate Button */}
                  <button
                    type="button"
                    id={`dup-btn-${project.id}`}
                    onClick={() => onDuplicateProject(project)}
                    className="p-2 text-white/50 hover:text-amber-400 hover:bg-white/[0.08] rounded-xl transition-all cursor-pointer"
                    title="Dupliquer le projet (cloner)"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    id={`del-btn-${project.id}`}
                    onClick={() => onDeleteProject(project)}
                    className="p-2 text-white/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                    title="Supprimer définitivement le projet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
