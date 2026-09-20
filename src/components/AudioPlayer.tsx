import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
  filename?: string;
  label?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, filename = 'audio.mp3', label }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error('Audio playback failed', err));
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    if (dur && !isNaN(dur)) {
      setProgress((current / dur) * 100);
      setCurrentTime(formatTime(current));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(formatTime(audioRef.current.duration));
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = Math.max(0, Math.min(1, clickX / width));
    if (audioRef.current.duration) {
      audioRef.current.currentTime = newProgress * audioRef.current.duration;
      setProgress(newProgress * 100);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-3 p-3.5 bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/[0.08] hover:border-orange-500/30 rounded-xl group/audio transition-all duration-300">
      <div className="flex items-center gap-3.5">
        {/* Play Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer shadow-md ${
            isPlaying
              ? 'bg-orange-500 text-white shadow-orange-500/30 ring-2 ring-orange-500/30'
              : 'bg-white/10 hover:bg-orange-500 text-white hover:shadow-orange-500/20'
          }`}
          title={isPlaying ? 'Pause' : 'Lecture'}
          aria-label={isPlaying ? 'Pause' : 'Lecture'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Center Track / Equalizer Bars */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
            <span className="truncate text-white/70 font-medium">{label || 'Voix Off Studio'}</span>
            <span className="tabular-nums">{currentTime} / {duration}</span>
          </div>

          {/* Interactive Progress Bar with animated visual waveform */}
          <div
            onClick={handleSeek}
            className="h-2 bg-white/10 rounded-full overflow-hidden relative cursor-pointer group/bar"
          >
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-100 relative"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm opacity-0 group-hover/bar:opacity-100" />
            </div>
          </div>
        </div>

        {/* Audio Visualizer Waves (bars dance when playing) */}
        <div className="hidden sm:flex items-center gap-0.5 h-6 px-1">
          {[40, 75, 55, 90, 60, 85, 45].map((h, i) => (
            <span
              key={i}
              style={{
                height: isPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 1 : 0.8)))}%` : '20%',
                animation: isPlaying ? `pulse 0.8s ease-in-out infinite alternate ${i * 0.1}s` : 'none'
              }}
              className="w-0.5 bg-orange-400/70 rounded-full transition-all duration-200"
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 text-white/40 hover:text-orange-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Télécharger l'audio"
            aria-label="Télécharger l'audio"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime('0:00');
        }}
        className="hidden"
      />
    </div>
  );
};
