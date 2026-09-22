import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal, Info, Play, Pause, Sparkles, Cpu, Skull, Volume2, VolumeX, Download, Eye, Layers, Box } from 'lucide-react';
import { GameEngine } from './engine/gameEngine';
import { DimensionMode, GameMode } from './types/game';
import { soundEngine } from './engine/soundEngine';
import { DIFFICULTY_SPRINTS } from './engine/sprintManager';
import { TriCoreDashboard } from './components/TriCoreDashboard';
import { NeuralNetworkVisualizer } from './components/NeuralNetworkVisualizer';
import { EvolutionStats } from './components/EvolutionStats';
import { GameControls } from './components/GameControls';
import { TacticalBriefingModal } from './components/TacticalBriefingModal';
import { PyTorchCodeModal } from './components/PyTorchCodeModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // React State for UI bindings
  const [mode, setMode] = useState<GameMode>('tri_ai');
  const [dimension, setDimension] = useState<DimensionMode>('2d');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(false);
  const [isPyTorchModalOpen, setIsPyTorchModalOpen] = useState<boolean>(false);
  const [showVisionHeatmap, setShowVisionHeatmap] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);

  // Telemetry tick state to trigger re-renders of HUD
  const [, setTick] = useState<number>(0);

  // Mount and initialize engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    // Hook callback to update UI stats regularly
    engine.onUpdateUI = () => {
      setDimension(engine.dimension);
      setTick((t) => (t + 1) % 10000);
    };

    engine.start();

    // Keyboard handlers
    const onKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
        e.preventDefault();
      }
      engine.handleKeyDown(e.code);
      setDimension(engine.dimension);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      engine.handleKeyUp(e.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      engine.destroy();
    };
  }, []);

  // Mode change handler
  const handleSetMode = useCallback((newMode: GameMode) => {
    setMode(newMode);
    if (engineRef.current) {
      engineRef.current.setMode(newMode);
    }
  }, []);

  // Dimension change handler
  const handleSetDimension = useCallback((dim: DimensionMode) => {
    setDimension(dim);
    if (engineRef.current) {
      engineRef.current.setDimension(dim);
    }
  }, []);

  // Difficulty Sprint handlers
  const handleSetSprint = useCallback((index: number) => {
    if (engineRef.current) {
      engineRef.current.setSprint(index);
      setTick((t) => (t + 1) % 10000);
    }
  }, []);

  const handleToggleAutoSprint = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.toggleAutoSprint();
      setTick((t) => (t + 1) % 10000);
    }
  }, []);

  const handleAdvanceSprint = useCallback(() => {
    if (engineRef.current) {
      const nextIndex = (engineRef.current.sprintManager.currentSprintIndex + 1) % 6;
      engineRef.current.setSprint(nextIndex);
      setTick((t) => (t + 1) % 10000);
    }
  }, []);

  // Speed change handler
  const handleSetSpeed = useCallback((spd: number) => {
    setSpeedMultiplier(spd);
    if (engineRef.current) {
      engineRef.current.setSpeedMultiplier(spd);
    }
  }, []);

  // Pause toggle
  const handleTogglePause = useCallback(() => {
    setIsPaused((p) => {
      const next = !p;
      if (engineRef.current) {
        engineRef.current.isPaused = next;
      }
      return next;
    });
  }, []);

  // Restart simulation
  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.initGame();
      soundEngine.playEvolutionChime();
    }
  }, []);

  // Mute toggle
  const handleToggleMute = useCallback(() => {
    soundEngine.isMuted = !soundEngine.isMuted;
    setIsMuted(soundEngine.isMuted);
  }, []);

  // Touch handlers for manual control
  const handleManualJump = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerManualJump();
    }
  }, []);

  const handleManualDuckStart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerManualDuck(true);
    }
  }, []);

  const handleManualDuckEnd = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerManualDuck(false);
    }
  }, []);

  // Manual hazard injection
  const handleInjectObstacle = useCallback((type: 'cactus_triple' | 'pterodactyl_mid' | 'pterodactyl_low' | 'emp_hazard') => {
    if (engineRef.current) {
      engineRef.current.spawnCustomObstacle(type);
    }
  }, []);

  // CV Toggles
  const handleToggleVisionHeatmap = useCallback(() => {
    if (engineRef.current) {
      const next = engineRef.current.toggleVisionHeatmap();
      setShowVisionHeatmap(next);
    }
  }, []);

  const handleToggleBoundingBoxes = useCallback(() => {
    if (engineRef.current) {
      const next = engineRef.current.toggleBoundingBoxes();
      setShowBoundingBoxes(next);
    }
  }, []);

  // Telemetry references from current engine
  const engine = engineRef.current;
  const championDino = engine?.championDino || null;
  const adversarialMetrics = engine?.architectAI.getAdversarialMetrics();
  const architectStats = engine?.architectAI.getWeaknessAnalysis() || {
    jumpTimingBias: 'balanced' as const,
    duckProficiency: 100,
    highSpeedSurvival: 100,
    clusterVulnerability: 20,
    currentThreatLevel: 1,
    activeStrategy: 'STANDARD_CALIBRATION',
    recentStrategies: [],
  };
  const architectLogs = engine?.architectAI.analysisLog || [];
  const optimizerTactics = engine && championDino
    ? engine.optimizerAI.computeOptimalTactics(
        championDino,
        engine.obstacles,
        engine.currentSpeed,
        engine.groundY
      )
    : {
        optimalNextAction: 'RUN' as const,
        recommendedJumpFrameDist: 120,
        dangerLevel: 10,
        predictedSurvivalChance: 90,
        trajectoryPoints: [],
        breakthroughLogs: [],
        recentAdaptations: [],
      };
  const hybridMetrics = engine?.optimizerAI.getHybridMetrics(optimizerTactics);
  const visionPerception = engine?.cvPerception;
  const gymStepInfo = engine?.gymStepInfo;
  const generationStats = engine?.generationStats || {
    generation: 1,
    bestScore: 0,
    currentBestScore: 0,
    aliveCount: 12,
    populationSize: 12,
    averageFitness: 0,
    history: [],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      {/* Top Cyber Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tracking-wider text-slate-100">
                  IAMDinosaur <span className="text-cyan-400">2027</span>
                </span>
                <span className="hidden sm:inline-block rounded border border-cyan-500/30 bg-cyan-950/60 px-1.5 py-0.2 text-[10px] font-mono text-cyan-300 font-semibold">
                  TRI-CORE PYTORCH MULTI-AGENT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                IA Criadora (Adversarial WGAN) • IA Superadora (PPO + Genética) • IA Jogadora (Gym & Visão)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-pytorch-code"
              type="button"
              onClick={() => setIsPyTorchModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold px-3 py-1.5 transition-all shadow-md shadow-cyan-900/30"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Código PyTorch / ZIP</span>
            </button>

            <button
              id="btn-open-briefing"
              type="button"
              onClick={() => setIsBriefingOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Protocolo Tri-Core</span>
            </button>

            <button
              id="btn-header-mute"
              type="button"
              onClick={handleToggleMute}
              className="rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 text-slate-400 hover:text-slate-200 transition-colors"
              title={isMuted ? 'Ativar Áudio' : 'Mutar Áudio'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Simulation Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-4">
        {/* Simulation Controls Bar */}
        <GameControls
          mode={mode}
          onSetMode={handleSetMode}
          dimension={dimension}
          onSetDimension={handleSetDimension}
          sprintState={
            engine?.sprintManager.getState() || {
              currentSprintIndex: 0,
              currentSprint: DIFFICULTY_SPRINTS[0],
              sprintScoreProgress: 0,
              sprintsCompletedCount: 0,
              isAutoSprintEnabled: true,
              bannerNotification: null,
            }
          }
          onSetSprint={handleSetSprint}
          onToggleAutoSprint={handleToggleAutoSprint}
          onAdvanceSprint={handleAdvanceSprint}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          speedMultiplier={speedMultiplier}
          onSetSpeed={handleSetSpeed}
          onRestart={handleRestart}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onManualJump={handleManualJump}
          onManualDuckStart={handleManualDuckStart}
          onManualDuckEnd={handleManualDuckEnd}
        />

        {/* 60 FPS Canvas Arena */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-1.5 shadow-2xl shadow-cyan-950/20 overflow-hidden">
          {/* Tech decorative corner accents */}
          <div className="absolute top-2 left-2 z-10 font-mono text-[10px] text-cyan-500/70 pointer-events-none flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            CANVAS ARENA // 60 FPS // VISÃO ATENÇÃO CNN & GYM REWARD
          </div>

          <div className="w-full overflow-x-auto flex justify-center bg-[#060a12] rounded-xl">
            <canvas
              ref={canvasRef}
              width={880}
              height={320}
              className="w-full max-w-[880px] h-auto block select-none cursor-pointer"
              onClick={handleManualJump}
            />
          </div>
        </div>

        {/* The 3 AIs Live Telemetry Grid */}
        <TriCoreDashboard
          architectStats={architectStats}
          architectLogs={architectLogs}
          optimizerTactics={optimizerTactics}
          championDino={championDino}
          aliveCount={engine?.generationStats.aliveCount ?? 12}
          totalPopulation={engine?.populationSize ?? 12}
          generation={engine?.currentGeneration ?? 1}
          gameSpeed={engine?.currentSpeed ?? 7}
          score={engine?.score ?? 0}
          adversarialMetrics={adversarialMetrics}
          hybridMetrics={hybridMetrics}
          visionPerception={visionPerception}
          gymStepInfo={gymStepInfo}
          showVisionHeatmap={showVisionHeatmap}
          showBoundingBoxes={showBoundingBoxes}
          onToggleVisionHeatmap={handleToggleVisionHeatmap}
          onToggleBoundingBoxes={handleToggleBoundingBoxes}
        />

        {/* Lower Row: Neural Synapse Inspector + Evolutionary History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NeuralNetworkVisualizer
            brain={championDino?.brain || null}
            lastAction={championDino?.lastAction || 'RUN'}
            confidence={championDino?.actionConfidence || 0.5}
          />

          <EvolutionStats
            stats={generationStats}
            currentScore={engine?.score ?? 0}
            currentSprint={engine?.sprintManager.currentSprint}
            onInjectObstacle={handleInjectObstacle}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 px-4 py-3 mt-auto font-mono text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            IAMDinosaur 2027 — Arquitetura Multiagente PyTorch & Gym (Código Aberto)
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPyTorchModalOpen(true)}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Download className="h-3 w-3" /> Baixar PyTorch Codebase (.ZIP)
            </button>
            <span>•</span>
            <span>Ivan Seidel Homage</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Active Co-Evolution</span>
          </div>
        </div>
      </footer>

      {/* Protocol Briefing Modal */}
      <TacticalBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        architectStats={architectStats}
        stats={generationStats}
      />

      {/* PyTorch Codebase & ZIP Modal */}
      <PyTorchCodeModal
        isOpen={isPyTorchModalOpen}
        onClose={() => setIsPyTorchModalOpen(false)}
      />
    </div>
  );
}
