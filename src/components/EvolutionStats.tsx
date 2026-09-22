import React from 'react';
import { Award, Zap, TrendingUp, History, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { DifficultySprint, GenerationStats } from '../types/game';

interface EvolutionStatsProps {
  stats: GenerationStats;
  currentScore: number;
  currentSprint?: DifficultySprint;
  onInjectObstacle: (type: 'cactus_triple' | 'pterodactyl_mid' | 'pterodactyl_low' | 'emp_hazard') => void;
}

export const EvolutionStats: React.FC<EvolutionStatsProps> = ({
  stats,
  currentScore,
  currentSprint,
  onInjectObstacle,
}) => {
  return (
    <div id="evolution-stats-card" className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 shadow-xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-200">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          LINHAGEM EVOLUTIVA & FITNESS
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <Award className="h-3.5 w-3.5 text-amber-400" />
          <span>RECORDE HISTÓRICO:</span>
          <span className="font-bold text-amber-300">
            {Math.max(stats.bestScore, currentScore)}
          </span>
        </div>
      </div>

      {/* Generation Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs mb-3">
        <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
          <div className="text-[10px] text-slate-400">GERAÇÃO ATUAL:</div>
          <div className="text-base font-bold text-cyan-400">#{stats.generation}</div>
        </div>
        <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
          <div className="text-[10px] text-slate-400">SCORE DA RODADA:</div>
          <div className="text-base font-bold text-slate-200">{currentScore}</div>
        </div>
        <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
          <div className="text-[10px] text-slate-400">SOBREVIVENTES:</div>
          <div className="text-base font-bold text-emerald-400">
            {stats.aliveCount} / {stats.populationSize}
          </div>
        </div>
        <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
          <div className="text-[10px] text-slate-400">TAXA DE SOBREVIVÊNCIA:</div>
          <div className="text-base font-bold text-indigo-400">
            {Math.round((stats.aliveCount / (stats.populationSize || 1)) * 100)}%
          </div>
        </div>
      </div>

      {/* Current Curriculum Sprint Breakdown */}
      {currentSprint && (
        <div className="mb-3 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
              <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />
              CURRÍCULO ADVERSARIAL ATUAL:
            </span>
            <span className="font-bold text-cyan-300">
              {currentSprint.title}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
            <span>Tier de Ameaça: <strong className="text-rose-400">T{currentSprint.threatTier}</strong></span>
            <span>Mix: <strong className="text-slate-200">{currentSprint.hazardMix.join(', ')}</strong></span>
            <span>Velocidades: <strong className="text-cyan-300">{currentSprint.minSpeed} - {currentSprint.maxSpeed} px/f</strong></span>
          </div>
        </div>
      )}

      {/* History Log Table */}
      <div className="mb-3">
        <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center gap-1">
          <History className="h-3 w-3 text-cyan-400" /> HISTÓRICO RECENTE DE GERAÇÕES:
        </div>
        {stats.history.length === 0 ? (
          <div className="py-2.5 text-center font-mono text-xs text-slate-500 rounded bg-slate-900/40 border border-slate-800/40">
            Co-evolução em andamento... Histórico computado após a extinção da 1ª geração.
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {stats.history.slice(0, 6).map((h, i) => (
              <div
                key={i}
                className="flex-shrink-0 rounded-lg bg-slate-900/80 border border-slate-800 p-2 font-mono text-[11px] min-w-[120px]"
              >
                <div className="flex justify-between text-slate-400">
                  <span>Gen #{h.generation}</span>
                  <span className="text-rose-400 text-[10px]">T{h.threatTier}</span>
                </div>
                <div className="font-bold text-cyan-300 mt-0.5">Top: {h.bestScore}</div>
                <div className="text-[10px] text-slate-400">Média: {h.avgScore}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adversarial Stress Test Controls */}
      <div className="rounded-lg bg-rose-950/20 border border-rose-900/40 p-2.5 font-mono">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="flex items-center gap-1.5 font-bold text-rose-300">
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            TESTE DE ESTRESSE MANUAL (INJETAR HAZARDS):
          </span>
          <span className="text-[10px] text-slate-400">Desafie a IA Runner agora</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            id="btn-inject-cactus-triple"
            type="button"
            onClick={() => onInjectObstacle('cactus_triple')}
            className="flex items-center gap-1 rounded bg-slate-900 hover:bg-rose-900/40 border border-slate-700 hover:border-rose-500/50 px-2.5 py-1 text-[11px] font-semibold text-rose-300 transition-colors"
          >
            <Zap className="h-3 w-3 text-rose-400" /> +Cacto Triplo Quântico
          </button>
          <button
            id="btn-inject-bird-mid"
            type="button"
            onClick={() => onInjectObstacle('pterodactyl_mid')}
            className="flex items-center gap-1 rounded bg-slate-900 hover:bg-rose-900/40 border border-slate-700 hover:border-rose-500/50 px-2.5 py-1 text-[11px] font-semibold text-amber-300 transition-colors"
          >
            <Zap className="h-3 w-3 text-amber-400" /> +Pterodáctilo Médio (Duck)
          </button>
          <button
            id="btn-inject-bird-low"
            type="button"
            onClick={() => onInjectObstacle('pterodactyl_low')}
            className="flex items-center gap-1 rounded bg-slate-900 hover:bg-rose-900/40 border border-slate-700 hover:border-rose-500/50 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 transition-colors"
          >
            <Zap className="h-3 w-3 text-cyan-400" /> +Pterodáctilo Rasteiro (Jump)
          </button>
          <button
            id="btn-inject-emp"
            type="button"
            onClick={() => onInjectObstacle('emp_hazard')}
            className="flex items-center gap-1 rounded bg-slate-900 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500/50 px-2.5 py-1 text-[11px] font-semibold text-purple-300 transition-colors"
          >
            <Sparkles className="h-3 w-3 text-purple-400" /> +Pulso EMP 4D
          </button>
        </div>
      </div>
    </div>
  );
};
