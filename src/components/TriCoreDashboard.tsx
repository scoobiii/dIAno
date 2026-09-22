import React from 'react';
import { Skull, Brain, ShieldAlert, Cpu, Sparkles, Activity, Eye, Radio, GitBranch } from 'lucide-react';
import {
  AdversarialCreatorMetrics,
  ArchitectWeaknessAnalysis,
  Dino,
  GymStepInfo,
  HybridPPOGeneticMetrics,
  OptimizerTactics,
  VisionPerception,
} from '../types/game';

interface TriCoreDashboardProps {
  architectStats: ArchitectWeaknessAnalysis;
  architectLogs: string[];
  optimizerTactics: OptimizerTactics;
  championDino: Dino | null;
  aliveCount: number;
  totalPopulation: number;
  generation: number;
  gameSpeed: number;
  score: number;
  adversarialMetrics?: AdversarialCreatorMetrics;
  hybridMetrics?: HybridPPOGeneticMetrics;
  visionPerception?: VisionPerception;
  gymStepInfo?: GymStepInfo;
  showVisionHeatmap?: boolean;
  showBoundingBoxes?: boolean;
  onToggleVisionHeatmap?: () => void;
  onToggleBoundingBoxes?: () => void;
}

export const TriCoreDashboard: React.FC<TriCoreDashboardProps> = ({
  architectStats,
  architectLogs,
  optimizerTactics,
  championDino,
  aliveCount,
  totalPopulation,
  generation,
  gameSpeed,
  score,
  adversarialMetrics,
  hybridMetrics,
  visionPerception,
  gymStepInfo,
  showVisionHeatmap,
  showBoundingBoxes,
  onToggleVisionHeatmap,
  onToggleBoundingBoxes,
}) => {
  return (
    <div id="tri-core-dashboard" className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* ========================================================================= */}
      {/* IA 1: IA CRIADORA (REDES ADVERSARIAIS / WGAN-GP) */}
      {/* ========================================================================= */}
      <div
        id="card-ia-criadora"
        className="flex flex-col rounded-xl border border-rose-900/60 bg-slate-950/80 p-3.5 shadow-lg backdrop-blur"
      >
        <div className="mb-2.5 flex items-center justify-between border-b border-rose-950/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Skull className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                IA CRIADORA
                <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-400">
                  WGAN-GP
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Cria dificuldades dinâmicas em tempo real</div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded bg-rose-950/80 px-2 py-0.5 border border-rose-800/40 text-[10px] font-mono text-rose-300 font-semibold">
            <ShieldAlert className="h-3 w-3" />
            TIER {architectStats.currentThreatLevel}
          </div>
        </div>

        {/* Tactical Status */}
        <div className="space-y-2 font-mono text-xs">
          <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800 flex justify-between items-center">
            <div>
              <div className="text-[10px] text-slate-400">ESTRATÉGIA ADVERSARIAL:</div>
              <div className="font-bold text-rose-400 truncate text-[11px]">
                {architectStats.activeStrategy}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">SOLUBILIDADE:</div>
              <div className="font-bold text-emerald-400 text-[11px]">
                {adversarialMetrics?.solvabilityScore ?? 96.5}%
              </div>
            </div>
          </div>

          {/* Adversarial Losses */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
              <span className="text-slate-400 text-[10px]">Loss Discriminador:</span>
              <div className="font-bold text-amber-400">
                L_D: {adversarialMetrics?.discriminatorLoss ?? 0.693}
              </div>
            </div>
            <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
              <span className="text-slate-400 text-[10px]">Loss Gerador:</span>
              <div className="font-bold text-rose-400">
                L_G: {adversarialMetrics?.generatorAdversarialLoss ?? 0.812}
              </div>
            </div>
          </div>

          {/* Weakness Exploitation Telemetry */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Viés de Pulo:</span>
              <span className="font-bold uppercase text-amber-400">
                {architectStats.jumpTimingBias}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Proficiência em Agachar:</span>
              <span className="font-bold text-cyan-400">
                {architectStats.duckProficiency}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-500 h-1.5 transition-all duration-300"
                style={{ width: `${architectStats.duckProficiency}%` }}
              />
            </div>
          </div>

          {/* Live Architect Log */}
          <div className="mt-2 rounded bg-slate-900/60 p-2 text-[10px] text-slate-400 border border-slate-800/50">
            <div className="text-[9px] font-bold text-rose-400/90 mb-1 flex items-center gap-1">
              <Activity className="h-2.5 w-2.5" /> LOG DE ADVERSIDADE:
            </div>
            <div className="h-12 overflow-y-auto space-y-1 font-mono leading-tight">
              {architectLogs.slice(0, 3).map((log, i) => (
                <div key={i} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* IA 2: IA SUPERADORA (PPO HÍBRIDO + GENÉTICA) */}
      {/* ========================================================================= */}
      <div
        id="card-ia-superadora"
        className="flex flex-col rounded-xl border border-emerald-900/60 bg-slate-950/80 p-3.5 shadow-lg backdrop-blur"
      >
        <div className="mb-2.5 flex items-center justify-between border-b border-emerald-950/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                IA SUPERADORA
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                  PPO + GENÉTICA
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Adapta políticas via RL híbrido evolutivo</div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded bg-emerald-950/80 px-2 py-0.5 border border-emerald-800/40 text-[10px] font-mono text-emerald-300 font-semibold">
            {optimizerTactics.predictedSurvivalChance}% SURVIVAL
          </div>
        </div>

        {/* Tactical Recommendation */}
        <div className="space-y-2 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
              <div className="text-[10px] text-slate-400">AÇÃO RECOMENDADA:</div>
              <div
                className={`font-bold ${
                  optimizerTactics.optimalNextAction === 'JUMP'
                    ? 'text-cyan-400'
                    : optimizerTactics.optimalNextAction === 'DUCK'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {optimizerTactics.optimalNextAction}
              </div>
            </div>
            <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
              <div className="text-[10px] text-slate-400">NÍVEL DE PERIGO:</div>
              <div
                className={`font-bold ${
                  optimizerTactics.dangerLevel > 70
                    ? 'text-rose-400'
                    : optimizerTactics.dangerLevel > 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {optimizerTactics.dangerLevel}%
              </div>
            </div>
          </div>

          {/* PPO RL Telemetry */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
              <span className="text-slate-400 text-[10px]">PPO Policy Loss:</span>
              <div className="font-bold text-emerald-400">
                {hybridMetrics?.policyLoss ?? 0.042}
              </div>
            </div>
            <div className="rounded bg-slate-900/80 p-1.5 border border-slate-800">
              <span className="text-slate-400 text-[10px]">Value Loss (MSE):</span>
              <div className="font-bold text-cyan-400">
                {hybridMetrics?.valueLoss ?? 0.118}
              </div>
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Mutação Genética:</span>
              <span className="font-bold text-amber-400">
                {( (hybridMetrics?.mutationRate ?? 0.12) * 100 ).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Pares de Crossover:</span>
              <span className="font-bold text-emerald-400">
                {hybridMetrics?.crossoverPairs ?? 5} pares PPO
              </span>
            </div>
          </div>

          {/* Optimizer Logs */}
          <div className="mt-2 rounded bg-slate-900/60 p-2 text-[10px] text-slate-400 border border-slate-800/50">
            <div className="text-[9px] font-bold text-emerald-400/90 mb-1 flex items-center gap-1">
              <Brain className="h-2.5 w-2.5" /> SUPERAÇÃO & MUTAÇÕES PPO:
            </div>
            <div className="h-12 overflow-y-auto space-y-1 font-mono leading-tight">
              {optimizerTactics.breakthroughLogs.slice(0, 3).map((log, i) => (
                <div key={i} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* IA 3: IA JOGADORA (VISÃO COMPUTACIONAL & GYMNASIUM RUNNER) */}
      {/* ========================================================================= */}
      <div
        id="card-ia-jogadora"
        className="flex flex-col rounded-xl border border-cyan-900/60 bg-slate-950/80 p-3.5 shadow-lg backdrop-blur"
      >
        <div className="mb-2.5 flex items-center justify-between border-b border-cyan-950/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                IA JOGADORA
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                  CV + GYM
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Visão computacional moderna em Gym</div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded bg-cyan-950/80 px-2 py-0.5 border border-cyan-800/40 text-[10px] font-mono text-cyan-300 font-semibold">
            GEN #{generation}
          </div>
        </div>

        {/* Runner Status */}
        <div className="space-y-2 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
              <div className="text-[10px] text-slate-400">POPULAÇÃO VIVA:</div>
              <div className="font-bold text-cyan-300 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                {aliveCount} / {totalPopulation}
              </div>
            </div>
            <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
              <div className="text-[10px] text-slate-400">REWARD GYM:</div>
              <div className="font-bold text-emerald-400">
                +{(gymStepInfo?.episodeReward ?? 0).toFixed(1)}
              </div>
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Distribuição Actor π:</span>
              <span className="font-bold text-cyan-400">
                R:{Math.round((visionPerception?.actionDistribution.run ?? 0.8) * 100)}% | J:{Math.round((visionPerception?.actionDistribution.jump ?? 0.1) * 100)}% | D:{Math.round((visionPerception?.actionDistribution.duck ?? 0.1) * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Estimativa Critic V(s):</span>
              <span className="font-bold text-emerald-400">
                +{championDino?.criticValue ?? 0.0}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Observação Gymnasium:</span>
              <span className="font-bold text-slate-200">
                (4, 84, 84) Greyscale
              </span>
            </div>
          </div>

          {/* Interactive CV Toggles */}
          <div className="flex items-center gap-2 pt-1">
            <button
              id="btn-toggle-cv-heatmap"
              type="button"
              onClick={onToggleVisionHeatmap}
              className={`flex-1 flex items-center justify-center gap-1 rounded py-1 text-[10px] font-mono border transition-all ${
                showVisionHeatmap
                  ? 'bg-rose-950/80 border-rose-700/60 text-rose-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Atenção CV: {showVisionHeatmap ? 'ON' : 'OFF'}</span>
            </button>

            <button
              id="btn-toggle-cv-boxes"
              type="button"
              onClick={onToggleBoundingBoxes}
              className={`flex-1 flex items-center justify-center gap-1 rounded py-1 text-[10px] font-mono border transition-all ${
                showBoundingBoxes
                  ? 'bg-cyan-950/80 border-cyan-700/60 text-cyan-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="h-3 w-3" />
              <span>Boxes: {showBoundingBoxes ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="mt-2 rounded bg-slate-900/60 p-2 text-[10px] text-slate-400 border border-slate-800/50">
            <div className="text-[9px] font-bold text-cyan-400/90 mb-1">
              STATUS DO CAMPEÃO // REDE NEURAL:
            </div>
            <div className="text-slate-300 text-[11px] leading-tight font-mono">
              Score: <strong className="text-cyan-300">{score}</strong>. 
              {championDino?.isAlive
                ? ` Ação: ${championDino.lastAction} (${Math.round(championDino.actionConfidence * 100)}% conf). Visão computacional mapeando entidades.`
                : ' Campeão colidiu. Próxima geração sendo adaptada pela IA Superadora.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
