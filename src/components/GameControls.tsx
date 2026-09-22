import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Bot,
  User,
  Crosshair,
  ArrowUp,
  ArrowDown,
  Layers,
  Box,
  Sparkles,
  Zap,
  ChevronRight,
  Gauge,
} from 'lucide-react';
import { DimensionMode, GameMode, SprintState } from '../types/game';
import { DIFFICULTY_SPRINTS } from '../engine/sprintManager';

interface GameControlsProps {
  mode: GameMode;
  onSetMode: (mode: GameMode) => void;
  dimension: DimensionMode;
  onSetDimension: (dim: DimensionMode) => void;
  sprintState: SprintState;
  onSetSprint: (index: number) => void;
  onToggleAutoSprint: () => void;
  onAdvanceSprint: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  speedMultiplier: number;
  onSetSpeed: (speed: number) => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onManualJump: () => void;
  onManualDuckStart: () => void;
  onManualDuckEnd: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  mode,
  onSetMode,
  dimension,
  onSetDimension,
  sprintState,
  onSetSprint,
  onToggleAutoSprint,
  onAdvanceSprint,
  isPaused,
  onTogglePause,
  speedMultiplier,
  onSetSpeed,
  onRestart,
  isMuted,
  onToggleMute,
  onManualJump,
  onManualDuckStart,
  onManualDuckEnd,
}) => {
  const currentSprint = sprintState.currentSprint;
  const progress = sprintState.sprintScoreProgress;
  const target = currentSprint.targetScore;
  const pct = Math.min(100, Math.round((progress / (target || 1)) * 100));

  return (
    <div id="game-controls-container" className="flex flex-col gap-2.5 font-mono text-xs">
      {/* Row 1: Mode Selection, Dimension Environments (2D/3D/4D), Speed & Simulation */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/85 p-2.5 shadow-lg backdrop-blur">
        {/* Left: Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            id="btn-mode-tri-ai"
            type="button"
            onClick={() => onSetMode('tri_ai')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold transition-all ${
              mode === 'tri_ai'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>3 IAs Co-Evolução</span>
          </button>
          <button
            id="btn-mode-human"
            type="button"
            onClick={() => onSetMode('human_vs_ai')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold transition-all ${
              mode === 'human_vs_ai'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Humano vs IA 1</span>
          </button>
          <button
            id="btn-mode-copilot"
            type="button"
            onClick={() => onSetMode('copilot')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold transition-all ${
              mode === 'copilot'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="h-3.5 w-3.5" />
            <span>Co-Piloto (IA 2 Ajuda)</span>
          </button>
        </div>

        {/* Center: Dimension Environments (2D, 3D, 4D) */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 font-bold px-1 hidden md:inline">AMBIENTE:</span>
          <button
            id="btn-dim-2d"
            type="button"
            onClick={() => onSetDimension('2d')}
            title="Ambiente 2D Vetorial Neon (Tecla [2])"
            className={`flex items-center gap-1 rounded px-2.5 py-1 font-bold text-[11px] transition-all ${
              dimension === '2d'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>2D</span>
          </button>
          <button
            id="btn-dim-3d"
            type="button"
            onClick={() => onSetDimension('3d')}
            title="Ambiente 3D Pista em Perspectiva e Z-Depth (Tecla [3])"
            className={`flex items-center gap-1 rounded px-2.5 py-1 font-bold text-[11px] transition-all ${
              dimension === '3d'
                ? 'bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            <span>3D Pista</span>
          </button>
          <button
            id="btn-dim-4d"
            type="button"
            onClick={() => onSetDimension('4d')}
            title="Ambiente 4D Tesseract e Curvatura Espaço-Temporal (Tecla [4])"
            className={`flex items-center gap-1 rounded px-2.5 py-1 font-bold text-[11px] transition-all ${
              dimension === '4d'
                ? 'bg-purple-500 text-slate-950 shadow-sm shadow-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>4D Tesseract</span>
          </button>
        </div>

        {/* Right: Speed & Audio & Restart */}
        <div className="flex items-center gap-2">
          {/* Speed Buttons */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                id={`btn-speed-${spd}x`}
                type="button"
                onClick={() => onSetSpeed(spd)}
                className={`rounded px-2 py-1 text-[11px] font-bold transition-colors ${
                  speedMultiplier === spd
                    ? 'bg-slate-700 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Pause / Play */}
          <button
            id="btn-toggle-pause"
            type="button"
            onClick={onTogglePause}
            className="flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 text-slate-200 transition-colors"
          >
            {isPaused ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Pause className="h-3.5 w-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isPaused ? 'Continuar' : 'Pausar'}</span>
          </button>

          {/* Restart */}
          <button
            id="btn-restart-sim"
            type="button"
            onClick={onRestart}
            title="Reiniciar Simulação"
            className="rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Sound Mute */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Ativar Som Sintetizado' : 'Silenciar'}
            className="rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Row 2: Automated Difficulty Sprints & Curriculum Progression */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 shadow-lg backdrop-blur flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          {/* Active Sprint Badge & Auto Status */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs"
              style={{
                borderColor: currentSprint.badgeColor + '66',
                backgroundColor: currentSprint.badgeColor + '18',
                color: currentSprint.badgeColor,
              }}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{currentSprint.title}</span>
              <span className="text-[10px] opacity-80">(TIER {currentSprint.threatTier})</span>
            </div>

            <button
              id="btn-toggle-auto-sprint"
              type="button"
              onClick={onToggleAutoSprint}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                sprintState.isAutoSprintEnabled
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  sprintState.isAutoSprintEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{sprintState.isAutoSprintEnabled ? 'AUTO-SPRINT: ATIVO' : 'SPRINT: MANUAL'}</span>
            </button>

            <span className="text-[11px] text-slate-400 hidden xl:inline">
              Estratégia: <strong className="text-slate-200">{currentSprint.architectStrategy}</strong>
            </span>
          </div>

          {/* Progress to next sprint & Fast-Forward control */}
          <div className="flex items-center gap-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-cyan-400" />
              <span>Vel: {currentSprint.minSpeed.toFixed(1)}-{currentSprint.maxSpeed.toFixed(1)} px/f</span>
              <span className="text-slate-600">•</span>
              <span className="font-bold text-slate-300">{progress} / {target} pts</span>
            </div>

            <button
              id="btn-advance-sprint"
              type="button"
              onClick={onAdvanceSprint}
              className="flex items-center gap-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:text-white transition-colors"
            >
              <span>Avançar Sprint</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Sprint Selector Tabs & Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {DIFFICULTY_SPRINTS.map((sp, idx) => {
              const isCurrent = sprintState.currentSprintIndex === idx;
              return (
                <button
                  key={sp.id}
                  id={`btn-sprint-tab-${sp.id}`}
                  type="button"
                  onClick={() => onSetSprint(idx)}
                  className={`flex flex-col p-1.5 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'border-cyan-500/70 bg-cyan-950/40 text-cyan-200 shadow-sm shadow-cyan-500/20'
                      : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold">SPRINT {idx + 1}</span>
                    <span
                      className="px-1 rounded text-[9px] font-mono"
                      style={{ color: sp.badgeColor }}
                    >
                      T{sp.threatTier}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold truncate text-slate-200 mt-0.5">
                    {sp.subtitle}
                  </div>
                  <div className="text-[9.5px] text-slate-500 truncate mt-0.5">
                    Meta: {sp.targetScore} pts
                  </div>
                </button>
              );
            })}
          </div>

          {/* Visual Progress Bar to Next Sprint */}
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
            <div
              className="h-full transition-all duration-300 ease-out rounded-full"
              style={{
                width: `${pct}%`,
                backgroundColor: currentSprint.badgeColor,
                boxShadow: `0 0 8px ${currentSprint.badgeColor}88`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Touch & Manual Controls for Human / Co-Pilot Mode */}
      {mode !== 'tri_ai' && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3 shadow-lg backdrop-blur">
          <div className="text-slate-400 text-xs flex items-center gap-2">
            <span className="font-bold text-slate-200">CONTROLES DO TECLADO:</span>
            <span className="rounded bg-slate-900 px-1.5 py-0.5 border border-slate-800 text-cyan-300">
              ESPAÇO / ↑
            </span>{' '}
            Pular |{' '}
            <span className="rounded bg-slate-900 px-1.5 py-0.5 border border-slate-800 text-amber-300">
              ↓
            </span>{' '}
            Agachar
          </div>

          <div className="flex gap-2">
            <button
              id="btn-touch-jump"
              type="button"
              onClick={onManualJump}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:scale-95 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-600/30 transition-all"
            >
              <ArrowUp className="h-4 w-4" />
              PULAR (JUMP)
            </button>
            <button
              id="btn-touch-duck"
              type="button"
              onMouseDown={onManualDuckStart}
              onMouseUp={onManualDuckEnd}
              onTouchStart={onManualDuckStart}
              onTouchEnd={onManualDuckEnd}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 active:scale-95 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-600/30 transition-all"
            >
              <ArrowDown className="h-4 w-4" />
              AGACHAR (DUCK)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
