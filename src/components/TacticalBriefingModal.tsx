import React from 'react';
import { X, ExternalLink, Cpu, Skull, Sparkles, Terminal, Info } from 'lucide-react';
import { ArchitectWeaknessAnalysis, GenerationStats } from '../types/game';

interface TacticalBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  architectStats: ArchitectWeaknessAnalysis;
  stats: GenerationStats;
}

export const TacticalBriefingModal: React.FC<TacticalBriefingModalProps> = ({
  isOpen,
  onClose,
  architectStats,
  stats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl font-mono text-slate-300">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 tracking-wider">
              IAMDinosaur 2027: PROTOCOLO TRI-CORE
            </h2>
            <p className="text-xs text-slate-400">
              Co-evolução Neural Adversarial inspirada em Ivan Seidel (2016)
            </p>
          </div>
        </div>

        {/* The 3 AIs Architecture Breakdown */}
        <div className="space-y-3.5 text-xs text-slate-300 max-h-[60vh] overflow-y-auto pr-2">
          <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
              <Skull className="h-4 w-4" />
              1. IA ARCHITECT (Cria Dificuldades / Adversary)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Mapeia fraquezas mecânicas do jogador em tempo real (viés de pulo antecipado vs tardio, taxa de acerto em agachamento e fadiga de velocidade). Quando detecta vulnerabilidades, altera proceduralmente a geração de obstáculos para testar armadilhas aéreas, cactos triplos quânticos e descompassos rítmicos.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
              <Sparkles className="h-4 w-4" />
              2. IA OPTIMIZER & ORACLE (Supera Dificuldades)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Resolve a cinemática da física de voo a 60 FPS, calculando arcos de parábola e janelas ideais de ação. No nível macro, opera o algoritmo genético: preserva os melhores campeões (elitismo), realiza recombinação de sinapses (crossover) e modula a taxa de mutação para quebrar estagnações.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-cyan-400 mb-1">
              <Cpu className="h-4 w-4" />
              3. IA RUNNER (Joga o Jogo)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Rede neural perceptron multicamadas profunda (8 entradas, 6 nós na camada oculta 1, 4 na camada oculta 2, e 3 saídas: PULAR, AGACHAR, CORRER). Recebe a distância, altitude, velocidade e dimensões dos obstáculos e ativa sinapses elétricas em tempo real.
            </p>
          </div>

          {/* Current Meta Matchup Telemetry */}
          <div className="rounded-xl bg-slate-900/50 p-3 border border-cyan-900/40 font-mono text-[11px]">
            <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> RELATÓRIO DO MATCHUP ATUAL:
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-400">
              <div>Geração Neural: <strong className="text-slate-200">#{stats.generation}</strong></div>
              <div>Ameaça do Architect: <strong className="text-rose-400">Tier {architectStats.currentThreatLevel}</strong></div>
              <div>Estratégia Ofensiva: <strong className="text-amber-400">{architectStats.activeStrategy}</strong></div>
              <div>Recorde de Linhagem: <strong className="text-emerald-400">{stats.bestScore} pts</strong></div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
            <a
              href="https://github.com/ivanseidel/IAMDinosaur"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-cyan-400 hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Repositório Original de Ivan Seidel (2016)
            </a>
            <span>Versão 2027 Neural Tri-Core</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition-colors"
          >
            RETORNAR À SIMULAÇÃO
          </button>
        </div>
      </div>
    </div>
  );
};
