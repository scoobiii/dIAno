import React from 'react';
import {
  Brain,
  Activity,
  Zap,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Flame,
  Gauge,
  Compass,
} from 'lucide-react';
import { VirtualFlyBrainState, NeuropilRegion } from '../types/virtualFlyBrain';

interface VirtualFlyBrainVisualizerProps {
  vfbState: VirtualFlyBrainState;
  lastAction?: 'RUN' | 'JUMP' | 'DUCK';
}

export const VirtualFlyBrainVisualizer: React.FC<VirtualFlyBrainVisualizerProps> = ({
  vfbState,
  lastAction = 'RUN',
}) => {
  const {
    neuropils,
    synapses,
    neurotransmitters,
    totalSpikesEmitted,
    giantFiberTriggered,
    mushroomBodyValence,
    centralComplexHeadingDeg,
    loomingVisualThreat,
    plasticityEventsCount,
    confidence,
  } = vfbState;

  const svgWidth = 480;
  const svgHeight = 290;

  // Neuropil scale mapping to SVG space
  const getCoords = (n: NeuropilRegion) => ({
    x: 40 + (n.x / 100) * (svgWidth - 90),
    y: 25 + (n.y / 100) * (svgHeight - 65),
  });

  return (
    <div
      id="virtual-fly-brain-card"
      className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/85 p-3.5 shadow-xl backdrop-blur font-mono text-xs"
    >
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-purple-300">
                CONNECTOMA BIOLÓGICO: VIRTUAL FLY BRAIN
              </span>
              <a
                href="https://github.com/VirtualFlyBrain"
                target="_blank"
                rel="noreferrer"
                title="Abrir repositório oficial VirtualFlyBrain no GitHub"
                className="flex items-center gap-1 rounded bg-slate-900 hover:bg-slate-800 px-1.5 py-0.5 text-[10px] text-cyan-400 hover:text-cyan-300 border border-slate-800 transition-colors"
              >
                <span>VFB/GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="text-[10px] text-slate-400">
              Arquitetura de Neuropilos da <em>Drosophila melanogaster</em> aplicada à cinemática do Dinossauro
            </div>
          </div>
        </div>

        {/* Reflex status */}
        <div className="flex items-center gap-2">
          {giantFiberTriggered ? (
            <span className="flex items-center gap-1 rounded-md bg-rose-500/30 border border-rose-500 px-2 py-0.5 font-bold text-rose-300 animate-pulse text-[11px]">
              <Zap className="h-3.5 w-3.5 text-rose-400" />
              GIANT FIBER: SALTO DE ESCAPE!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Spikes: {totalSpikesEmitted}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Connectome SVG Canvas */}
      <div className="relative overflow-hidden rounded-lg bg-slate-900/60 border border-slate-800/80 p-1 mb-2.5">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
          <defs>
            <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="loomingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background Drosophila Brain Silhouette Glow */}
          <ellipse
            cx={svgWidth * 0.5}
            cy={svgHeight * 0.48}
            rx={svgWidth * 0.44}
            ry={svgHeight * 0.42}
            fill="url(#brainGlow)"
          />

          {/* Synaptic Pathway Lines */}
          {synapses.map((syn) => {
            const src = neuropils.find((n) => n.id === syn.sourceNeuropilId);
            const tgt = neuropils.find((n) => n.id === syn.targetNeuropilId);
            if (!src || !tgt) return null;

            const p1 = getCoords(src);
            const p2 = getCoords(tgt);

            const isSpiking = syn.spikeActive;
            const strokeColor =
              syn.neurotransmitter === 'dopamine'
                ? '#fb7185'
                : syn.neurotransmitter === 'octopamine'
                ? '#f59e0b'
                : syn.neurotransmitter === 'gaba'
                ? '#38bdf8'
                : '#34d399';

            return (
              <g key={syn.id}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={strokeColor}
                  strokeWidth={isSpiking ? 2.6 : 1.2}
                  strokeOpacity={isSpiking ? 0.9 : 0.3}
                  strokeDasharray={isSpiking ? '4, 2' : undefined}
                />
                {isSpiking && (
                  <circle
                    cx={(p1.x + p2.x) * 0.5}
                    cy={(p1.y + p2.y) * 0.5}
                    r={3}
                    fill={strokeColor}
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}

          {/* Neuropil Nodes */}
          {neuropils.map((neuropil) => {
            const pos = getCoords(neuropil);
            const radius = Math.max(9, Math.min(22, Math.sqrt(neuropil.neuronCount) * 0.08 + 8));
            const isActive = neuropil.activityLevel > 0.4;

            return (
              <g key={neuropil.id} className="cursor-pointer">
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius + (isActive ? 3 : 0)}
                  fill={neuropil.color}
                  fillOpacity={0.25 + neuropil.activityLevel * 0.65}
                  stroke={neuropil.color}
                  strokeWidth={isActive ? 2 : 1}
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={4}
                  fill="#ffffff"
                  fillOpacity={0.8}
                />
                {/* Acronym Label */}
                <text
                  x={pos.x}
                  y={pos.y + 3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {neuropil.acronym}
                </text>
                {/* Firing rate info */}
                <text
                  x={pos.x}
                  y={pos.y + radius + 10}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  {neuropil.firingRateHz}Hz
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend overlays */}
        <div className="absolute bottom-1.5 left-2 flex items-center gap-2 text-[9.5px] text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
          <span className="text-cyan-400">● Óptico (ME/LP)</span>
          <span className="text-purple-400">● Central (EB/FB/PB)</span>
          <span className="text-amber-400">● Cogumelo (KC/MBON)</span>
          <span className="text-rose-400">● Motor (GF)</span>
        </div>

        <div className="absolute top-1.5 right-2 flex items-center gap-1.5 text-[9.5px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
          <Compass className="h-3 w-3 text-purple-400" />
          <span>Vetor EB: {centralComplexHeadingDeg}°</span>
        </div>
      </div>

      {/* Neurotransmitter & Biological Telemetry Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
        {/* Dopamine (DA) */}
        <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="text-rose-400 font-bold">DOPAMINA (DA)</span>
            <span>{neurotransmitters.dopamine}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${neurotransmitters.dopamine}%` }}
            />
          </div>
          <div className="text-[9px] text-slate-500 mt-1">Recompensa & Plasticidade STDP</div>
        </div>

        {/* Octopamine (OA) */}
        <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="text-amber-400 font-bold">OCTOPAMINA (OA)</span>
            <span>{neurotransmitters.octopamine}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${neurotransmitters.octopamine}%` }}
            />
          </div>
          <div className="text-[9px] text-slate-500 mt-1">Alerta & Velocidade Cinemática</div>
        </div>

        {/* GABA */}
        <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="text-cyan-400 font-bold">GABA (INIBIDOR)</span>
            <span>{neurotransmitters.gaba}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${neurotransmitters.gaba}%` }}
            />
          </div>
          <div className="text-[9px] text-slate-500 mt-1">Filtro de Ruído & Modulação</div>
        </div>

        {/* Acetylcholine (ACh) */}
        <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="text-emerald-400 font-bold">ACETILCOLINA (ACh)</span>
            <span>{neurotransmitters.acetylcholine}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${neurotransmitters.acetylcholine}%` }}
            />
          </div>
          <div className="text-[9px] text-slate-500 mt-1">Transmissão Neuromuscular Rápida</div>
        </div>
      </div>

      {/* Looming Threat & Action Recommendation */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-900/80 p-2 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-slate-400">
            TAXA DE EXPANSÃO ÓPTICA (LOOMING):{' '}
            <strong className="text-rose-400 font-mono">
              {(loomingVisualThreat * 100).toFixed(0)}%
            </strong>
          </div>
          <div className="text-[10px] text-slate-400">
            VALÊNCIA MBON:{' '}
            <strong className="text-amber-400 font-mono">
              {(mushroomBodyValence * 100).toFixed(0)}%
            </strong>
          </div>
          <div className="text-[10px] text-slate-400">
            EVENTOS DE PLASTICIDADE:{' '}
            <strong className="text-cyan-400 font-mono">{plasticityEventsCount}</strong>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400">AÇÃO BIOLÓGICA:</span>
          <span
            className={`rounded px-2 py-0.5 font-bold text-xs ${
              lastAction === 'JUMP'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                : lastAction === 'DUCK'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
            }`}
          >
            {lastAction} ({Math.round(confidence * 100)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
