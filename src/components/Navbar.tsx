import React from 'react';
import { 
  Clapperboard, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Film, 
  FolderKanban, 
  Plus, 
  Edit3, 
  Smartphone, 
  Monitor, 
  Square,
  Save
} from 'lucide-react';
import { Storyboard, Project } from '../types';

interface NavbarProps {
  currentView: 'projects' | 'studio';
  onChangeView: (view: 'projects' | 'studio') => void;
  activeProject: Project | null;
  projectsCount: number;
  storyboard: Storyboard | null;
  isExporting: boolean;
  onExportPDF: () => void;
  onReset: () => void;
  onCreateNewProject: () => void;
  onEditActiveProject?: () => void;
  onSaveActiveProject?: () => void;
  isSaving?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onChangeView,
  activeProject,
  projectsCount,
  storyboard,
  isExporting,
  onExportPDF,
  onReset,
  onCreateNewProject,
  onEditActiveProject,
  onSaveActiveProject,
  isSaving
}) => {
  const totalDuration = storyboard
    ? Math.round(
        storyboard.scenes.reduce((acc, sc) => {
          const match = sc.duration?.match(/\d+(\.\d+)?/);
          return acc + (match ? parseFloat(match[0]) : 4);
        }, 0)
      )
    : (activeProject?.targetTotalDuration || 30);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07080d]/80 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Logo & Navigation Tabs */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div 
            onClick={() => onChangeView('projects')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold font-display tracking-tight text-white text-base sm:text-lg">
                  AI DIRECTOR
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold tracking-wider uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-md hidden xs:inline">
                  PRO 3.1
                </span>
              </div>
              <span className="text-[10px] text-white/40 tracking-wider font-mono hidden md:inline">
                Système de Production Cinéma & Vidéo
              </span>
            </div>
          </div>

          {/* View Toggle Tabs */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              id="nav-tab-projects"
              onClick={() => onChangeView('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'projects'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Mes Projets</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                currentView === 'projects' ? 'bg-black/30 text-white' : 'bg-white/10 text-white/60'
              }`}>
                {projectsCount}
              </span>
            </button>

            <button
              type="button"
              id="nav-tab-studio"
              onClick={() => onChangeView('studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'studio'
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Studio</span>
              {activeProject && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Projet actif chargé" />
              )}
            </button>
          </div>
        </div>

        {/* Center: Active Project Info in Studio View */}
        {currentView === 'studio' && activeProject && (
          <div className="hidden lg:flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3.5 py-1.5 rounded-full max-w-sm">
            <span className="text-xs text-white/70 font-medium truncate max-w-[150px]" title={activeProject.title}>
              {activeProject.title}
            </span>
            <span className="text-white/20">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-orange-300">
              {activeProject.format === '9:16' && <Smartphone className="w-3 h-3" />}
              {activeProject.format === '16:9' && <Monitor className="w-3 h-3" />}
              {activeProject.format === '1:1' && <Square className="w-3 h-3" />}
              <span>{activeProject.format}</span>
            </span>
            {onEditActiveProject && (
              <button
                type="button"
                onClick={onEditActiveProject}
                className="p-1 text-white/40 hover:text-white rounded transition-colors cursor-pointer"
                title="Modifier les détails du projet"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {currentView === 'projects' ? (
            <button
              type="button"
              id="nav-btn-new-project"
              onClick={onCreateNewProject}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Projet</span>
            </button>
          ) : (
            <>
              {/* Save Project Button */}
              {onSaveActiveProject && (
                <button
                  type="button"
                  onClick={onSaveActiveProject}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Sauvegarder le projet en base de données"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </button>
              )}

              {/* Export PDF */}
              {storyboard && (
                <button
                  type="button"
                  onClick={onExportPDF}
                  disabled={isExporting}
                  className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Export...' : 'Exporter PDF'}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
