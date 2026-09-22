import React, { useMemo } from 'react';
import { NeuralNetwork } from '../engine/neuralNetwork';

interface NeuralNetworkVisualizerProps {
  brain: NeuralNetwork | null;
  lastAction?: 'JUMP' | 'DUCK' | 'RUN';
  confidence?: number;
}

export const NeuralNetworkVisualizer: React.FC<NeuralNetworkVisualizerProps> = ({
  brain,
  lastAction = 'RUN',
  confidence = 0.5,
}) => {
  const inputLabels = [
    'Dist Obs 1',
    'Obs Width',
    'Obs Height',
    'Obs Altitude',
    'Dist Obs 2',
    'Dino Y',
    'Dino Vy',
    'Sim Speed',
  ];

  const outputLabels = ['JUMP', 'DUCK', 'RUN'];

  // Dimensions
  const width = 420;
  const height = 240;

  // Node positions computation
  const nodeLayout = useMemo(() => {
    const layers = [
      { count: 8, x: 45, labels: inputLabels },
      { count: 6, x: 165 },
      { count: 4, x: 275 },
      { count: 3, x: 375, labels: outputLabels },
    ];

    return layers.map((layer) => {
      const step = height / (layer.count + 1);
      return Array.from({ length: layer.count }, (_, i) => ({
        x: layer.x,
        y: step * (i + 1),
        label: layer.labels ? layer.labels[i] : undefined,
      }));
    });
  }, [height]);

  if (!brain) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs font-mono text-slate-500">
        INITIALIZING NEURAL TELEMETRY...
      </div>
    );
  }

  const state = brain.lastState;

  return (
    <div id="neural-visualizer-card" className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/80 p-3 shadow-xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-xs font-semibold tracking-wider text-cyan-300">
            CHAMPION SYNAPSE TOPOLOGY (8-6-4-3)
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400">OUTPUT:</span>
          <span
            className={`rounded px-1.5 py-0.5 font-bold ${
              lastAction === 'JUMP'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : lastAction === 'DUCK'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {lastAction} ({Math.round((confidence || 0) * 100)}%)
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Synaptic Weights: Layer 1 (Inputs -> Hidden 1) */}
          {nodeLayout[0].map((inNode, i) =>
            nodeLayout[1].map((h1Node, j) => {
              const weight = brain.layer1.weights[i]?.[j] ?? 0;
              const isPositive = weight >= 0;
              const thickness = Math.min(2.8, Math.max(0.4, Math.abs(weight) * 0.7));
              const opacity = Math.min(0.7, Math.max(0.08, Math.abs(weight) * 0.35));
              return (
                <line
                  key={`l1_${i}_${j}`}
                  x1={inNode.x}
                  y1={inNode.y}
                  x2={h1Node.x}
                  y2={h1Node.y}
                  stroke={isPositive ? '#06b6d4' : '#f43f5e'}
                  strokeWidth={thickness}
                  strokeOpacity={opacity}
                />
              );
            })
          )}

          {/* Synaptic Weights: Layer 2 (Hidden 1 -> Hidden 2) */}
          {nodeLayout[1].map((h1Node, i) =>
            nodeLayout[2].map((h2Node, j) => {
              const weight = brain.layer2.weights[i]?.[j] ?? 0;
              const isPositive = weight >= 0;
              const thickness = Math.min(2.8, Math.max(0.4, Math.abs(weight) * 0.7));
              const opacity = Math.min(0.75, Math.max(0.08, Math.abs(weight) * 0.4));
              return (
                <line
                  key={`l2_${i}_${j}`}
                  x1={h1Node.x}
                  y1={h1Node.y}
                  x2={h2Node.x}
                  y2={h2Node.y}
                  stroke={isPositive ? '#06b6d4' : '#f43f5e'}
                  strokeWidth={thickness}
                  strokeOpacity={opacity}
                />
              );
            })
          )}

          {/* Synaptic Weights: Layer 3 (Hidden 2 -> Outputs) */}
          {nodeLayout[2].map((h2Node, i) =>
            nodeLayout[3].map((outNode, j) => {
              const weight = brain.layer3.weights[i]?.[j] ?? 0;
              const isPositive = weight >= 0;
              const thickness = Math.min(3.2, Math.max(0.6, Math.abs(weight) * 0.8));
              const opacity = Math.min(0.85, Math.max(0.12, Math.abs(weight) * 0.5));
              return (
                <line
                  key={`l3_${i}_${j}`}
                  x1={h2Node.x}
                  y1={h2Node.y}
                  x2={outNode.x}
                  y2={outNode.y}
                  stroke={isPositive ? '#10b981' : '#ec4899'}
                  strokeWidth={thickness}
                  strokeOpacity={opacity}
                />
              );
            })
          )}

          {/* Render Input Nodes */}
          {nodeLayout[0].map((node, i) => {
            const val = state.inputs[i] ?? 0;
            const norm = Math.max(0, Math.min(1, val));
            return (
              <g key={`in_${i}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={5}
                  fill={`rgb(${Math.round(20 + norm * 200)}, ${Math.round(180 + norm * 75)}, 255)`}
                  stroke="#082f49"
                  strokeWidth={1.5}
                />
                <text
                  x={node.x - 7}
                  y={node.y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {node.label}
                </text>
              </g>
            );
          })}

          {/* Render Hidden 1 Nodes */}
          {nodeLayout[1].map((node, i) => {
            const val = state.hidden1[i] ?? 0;
            const norm = (val + 1) / 2; // -1..1 to 0..1
            return (
              <g key={`h1_${i}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={5.5}
                  fill={val >= 0 ? '#06b6d4' : '#64748b'}
                  fillOpacity={0.3 + norm * 0.7}
                  stroke="#0e7490"
                  strokeWidth={1.5}
                />
              </g>
            );
          })}

          {/* Render Hidden 2 Nodes */}
          {nodeLayout[2].map((node, i) => {
            const val = state.hidden2[i] ?? 0;
            const norm = (val + 1) / 2;
            return (
              <g key={`h2_${i}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={6}
                  fill={val >= 0 ? '#10b981' : '#475569'}
                  fillOpacity={0.35 + norm * 0.65}
                  stroke="#059669"
                  strokeWidth={1.5}
                />
              </g>
            );
          })}

          {/* Render Output Nodes */}
          {nodeLayout[3].map((node, i) => {
            const val = state.outputs[i] ?? 0;
            const isWinner =
              (i === 0 && lastAction === 'JUMP') ||
              (i === 1 && lastAction === 'DUCK') ||
              (i === 2 && lastAction === 'RUN');
            return (
              <g key={`out_${i}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isWinner ? 8 : 6.5}
                  fill={isWinner ? '#38bdf8' : '#334155'}
                  stroke={isWinner ? '#ffffff' : '#64748b'}
                  strokeWidth={isWinner ? 2.5 : 1}
                />
                <text
                  x={node.x + 12}
                  y={node.y + 3.5}
                  textAnchor="start"
                  fill={isWinner ? '#38bdf8' : '#64748b'}
                  fontWeight={isWinner ? 'bold' : 'normal'}
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  {node.label} ({(val * 100).toFixed(0)}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-3 rounded-sm bg-cyan-500" /> +Weight
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-3 rounded-sm bg-rose-500" /> -Inhibitory
          </span>
        </div>
        <span className="text-slate-500">Live 60Hz Synaptic Feed</span>
      </div>
    </div>
  );
};
