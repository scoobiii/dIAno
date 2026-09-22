import {
  ChronoGhost,
  DifficultySprint,
  DimensionMode,
  Dino,
  GameMode,
  GenerationStats,
  GymStepInfo,
  Obstacle,
  SprintState,
  VisionPerception,
} from '../types/game';
import { ArchitectAI } from './architectAI';
import { DimensionalRenderer } from './dimensionalRenderer';
import { EnvironmentEpoch, EnvironmentEvolutionManager, EVOLUTIONARY_EPOCHS } from './environmentEvolution';
import { NeuralNetwork } from './neuralNetwork';
import { OptimizerAI } from './optimizerAI';
import { soundEngine } from './soundEngine';
import { SprintManager } from './sprintManager';
import { VirtualFlyBrainEngine } from './virtualFlyBrain';
import { VUAConnectorAI } from './vuaConnectorAI';
import { DinoRenderer } from './dinoRenderer';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public width: number = 880;
  public height: number = 320;
  public groundY: number = 265;

  public mode: GameMode = 'tri_ai';
  public isRunning: boolean = true;
  public isPaused: boolean = false;
  public speedMultiplier: number = 1.0; // 1x, 2x, 5x, 10x

  // Multi-dimensional environments (2D Vector, 3D Track Perspective, 4D Tesseract)
  public dimension: DimensionMode = '2d';
  public tesseractAngleXW: number = 0;
  public tesseractAngleYW: number = 0;
  public tesseractAngleZW: number = 0;
  public chronoHistory: {
    time: number;
    x: number;
    y: number;
    isDucking: boolean;
    isJumping: boolean;
    color: string;
  }[] = [];

  // Automated Difficulty Sprints Manager
  public sprintManager: SprintManager = new SprintManager();

  // Evolutionary Planetary Environments Manager
  public environmentEvolution: EnvironmentEvolutionManager = new EnvironmentEvolutionManager();

  // Drosophila Connectome Biocomputing Engine (VirtualFlyBrain)
  public virtualFlyBrain: VirtualFlyBrainEngine = new VirtualFlyBrainEngine();

  // VUA Connector AI (Vortex Agent Governance & GitHub PR / Pages Automation)
  public vuaConnector: VUAConnectorAI;

  // Physics constants
  public baseSpeed: number = 7.0;
  public currentSpeed: number = 7.0;
  public gravity: number = 0.68;
  public jumpStrength: number = -12.4;

  // Simulation entities
  public populationSize: number = 12;
  public dinos: Dino[] = [];
  public obstacles: Obstacle[] = [];
  public particles: Particle[] = [];
  public nextObstacleTimer: number = 80;

  // The 3 AI Engines
  public architectAI: ArchitectAI = new ArchitectAI();
  public optimizerAI: OptimizerAI = new OptimizerAI();
  public championDino: Dino | null = null;

  // Modern Computer Vision & Gym Environment Perception
  public showVisionHeatmap: boolean = true;
  public showBoundingBoxes: boolean = true;
  public cvPerception: VisionPerception = {
    processedFrameWidth: 84,
    processedFrameHeight: 84,
    frameStackDepth: 4,
    detectedEntities: [],
    saliencyPoints: [],
    opticalFlowSpeed: 7.0,
    criticValueEstimate: 0.0,
    actionDistribution: { run: 0.8, jump: 0.1, duck: 0.1 },
  };
  public gymStepInfo: GymStepInfo = {
    stepCount: 0,
    episodeReward: 0,
    lastReward: 0.1,
    actionTaken: 0,
    isTruncated: false,
    isTerminated: false,
    fps: 60,
  };

  // Human player state (when in human_vs_ai or copilot)
  public humanDino: Dino | null = null;
  public humanJumpRequested: boolean = false;
  public humanDuckRequested: boolean = false;

  // Stats
  public score: number = 0;
  public bestScore: number = 0;
  public currentGeneration: number = 1;
  public generationStats: GenerationStats = {
    generation: 1,
    bestScore: 0,
    currentBestScore: 0,
    aliveCount: 12,
    populationSize: 12,
    averageFitness: 0,
    history: [],
  };

  // Visual effects
  public gridOffset: number = 0;
  public screenShake: number = 0;
  private animationFrameId: number | null = null;
  public onUpdateUI?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not supported');
    this.ctx = ctx;
    this.vuaConnector = new VUAConnectorAI(this.virtualFlyBrain);

    this.initGame();
  }

  public setDimension(dim: DimensionMode): void {
    this.dimension = dim;
    soundEngine.playDimensionWarp(dim);
    this.screenShake = 6;
  }

  public setSprint(index: number): void {
    const next = this.sprintManager.setSprint(index);
    this.architectAI.applySprintCurriculum(next.architectStrategy, next.threatTier, next.hazardMix);
    this.currentSpeed = next.minSpeed;
    this.screenShake = 8;
  }

  public toggleAutoSprint(): boolean {
    return this.sprintManager.toggleAutoSprint();
  }

  public setEnvironmentEpoch(index: number): void {
    const epoch = this.environmentEvolution.setEpoch(index);
    this.applyEnvironmentEpoch(epoch);
  }

  public toggleAutoEpochEvolution(): boolean {
    return this.environmentEvolution.toggleAutoEvolution();
  }

  public applyEnvironmentEpoch(epoch: EnvironmentEpoch): void {
    this.gravity = epoch.gravity;
    this.jumpStrength = epoch.jumpStrength;
    this.screenShake = 10;
    soundEngine.playDimensionWarp(this.dimension);
  }

  public emitSprintCelebrationParticles(): void {
    const colors = ['#38bdf8', '#34d399', '#f43f5e', '#a855f7', '#fbbf24'];
    for (let i = 0; i < 45; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * (this.height * 0.6);
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3.5 + 1.5,
        life: 0,
        maxLife: Math.floor(Math.random() * 30 + 20),
      });
    }
  }

  public initGame(): void {
    const curSprint = this.sprintManager.currentSprint;
    this.currentSpeed = curSprint.minSpeed;
    this.score = 0;
    this.obstacles = [];
    this.particles = [];
    this.nextObstacleTimer = 90;
    this.chronoHistory = [];

    // Apply sprint curriculum to Architect AI
    this.architectAI.applySprintCurriculum(curSprint.architectStrategy, curSprint.threatTier, curSprint.hazardMix);

    if (this.mode === 'tri_ai') {
      this.dinos = [];
      for (let i = 0; i < this.populationSize; i++) {
        const brain = NeuralNetwork.createRandom();
        if (i > 0) {
          brain.mutate(0.2, 0.4);
        }
        this.dinos.push({
          id: i,
          isAlive: true,
          x: 60,
          y: this.groundY - 48,
          vy: 0,
          width: 44,
          height: 48,
          isJumping: false,
          isDucking: false,
          score: 0,
          fitness: 0,
          brain,
          color: i === 0 ? '#38bdf8' : '#22d3ee',
          jumpCount: 0,
          duckCount: 0,
          lastAction: 'RUN',
          actionConfidence: 0.8,
        });
      }
      this.championDino = this.dinos[0];
    } else {
      // Human mode
      this.humanDino = {
        id: 0,
        isAlive: true,
        x: 60,
        y: this.groundY - 48,
        vy: 0,
        width: 44,
        height: 48,
        isJumping: false,
        isDucking: false,
        score: 0,
        fitness: 0,
        brain: NeuralNetwork.createRandom(),
        color: '#38bdf8',
        jumpCount: 0,
        duckCount: 0,
        lastAction: 'RUN',
        actionConfidence: 1.0,
      };
      this.dinos = [this.humanDino];
      this.championDino = this.humanDino;
    }

    this.generationStats.aliveCount = this.dinos.length;
    this.generationStats.populationSize = this.dinos.length;
  }

  public setMode(newMode: GameMode): void {
    this.mode = newMode;
    this.currentGeneration = 1;
    this.architectAI.resetStats();
    this.optimizerAI.reset();
    this.generationStats.history = [];
    this.initGame();
  }

  public setSpeedMultiplier(mult: number): void {
    this.speedMultiplier = mult;
  }

  public handleKeyDown(code: string): void {
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
      this.humanJumpRequested = true;
      if (this.mode !== 'tri_ai' && this.humanDino && !this.humanDino.isAlive) {
        // Restart human run
        this.initGame();
      }
    } else if (code === 'ArrowDown' || code === 'KeyS') {
      this.humanDuckRequested = true;
    } else if (code === 'Digit2' || code === 'Numpad2') {
      this.setDimension('2d');
    } else if (code === 'Digit3' || code === 'Numpad3') {
      this.setDimension('3d');
    } else if (code === 'Digit4' || code === 'Numpad4') {
      this.setDimension('4d');
    }
  }

  public handleKeyUp(code: string): void {
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
      this.humanJumpRequested = false;
    } else if (code === 'ArrowDown' || code === 'KeyS') {
      this.humanDuckRequested = false;
    }
  }

  public triggerManualJump(): void {
    this.humanJumpRequested = true;
    setTimeout(() => {
      this.humanJumpRequested = false;
    }, 120);
    if (this.mode !== 'tri_ai' && this.humanDino && !this.humanDino.isAlive) {
      this.initGame();
    }
  }

  public triggerManualDuck(active: boolean): void {
    this.humanDuckRequested = active;
  }

  public spawnCustomObstacle(type: 'cactus_triple' | 'pterodactyl_mid' | 'pterodactyl_low' | 'emp_hazard'): void {
    const width = type === 'cactus_triple' ? 68 : type === 'emp_hazard' ? 48 : 46;
    const height = type === 'cactus_triple' ? 50 : type === 'emp_hazard' ? 48 : 36;
    const y =
      type === 'cactus_triple'
        ? this.groundY - height
        : type === 'emp_hazard'
        ? this.groundY - 62
        : type === 'pterodactyl_mid'
        ? this.groundY - 58
        : this.groundY - 38;

    this.obstacles.push({
      id: `manual_${Date.now()}`,
      type,
      x: this.width + 40,
      y,
      width,
      height,
      speedMultiplier: type === 'emp_hazard' ? 0.95 : 1.0,
      hazardRating: type === 'emp_hazard' ? 9 : 8,
      passed: false,
      spawnedByArchitectStrategy: 'USER_INJECTED_TEST',
    });
  }

  public start(): void {
    if (this.animationFrameId !== null) return;
    this.isRunning = true;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      if (!this.isPaused) {
        // Run physics sub-steps based on speedMultiplier
        const steps = Math.min(10, Math.max(1, Math.round(this.speedMultiplier)));
        for (let s = 0; s < steps; s++) {
          this.updatePhysics();
        }
      }

      this.render();

      if (this.onUpdateUI && Math.random() < 0.15) {
        this.onUpdateUI();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isRunning = false;
  }

  private updatePhysics(): void {
    // Automated Environmental Planetary Epoch Evolution
    const evolvedEpoch = this.environmentEvolution.evaluateEvolution(
      this.currentGeneration,
      this.sprintManager.currentSprintIndex
    );
    if (evolvedEpoch) {
      this.applyEnvironmentEpoch(evolvedEpoch);
    }

    // Automated Difficulty Sprints Progression Update
    const sprintUpdate = this.sprintManager.update(this.score);
    if (sprintUpdate.didAdvance && sprintUpdate.newSprint) {
      soundEngine.playSprintCompleted();
      this.architectAI.applySprintCurriculum(
        sprintUpdate.newSprint.architectStrategy,
        sprintUpdate.newSprint.threatTier,
        sprintUpdate.newSprint.hazardMix
      );
      this.screenShake = 12;
      this.gymStepInfo.episodeReward += 40.0; // Gym evolutionary bonus
      this.emitSprintCelebrationParticles();

      // VUA Connector AI evaluation using VFB connectome topology
      this.vuaConnector.evaluateEvolutionaryProgress(
        this.currentGeneration,
        this.score,
        this.bestScore,
        this.sprintManager.currentSprintIndex,
        this.environmentEvolution.currentEpoch.name,
        true
      );
    }

    // Dynamic speed based on sprint curriculum or progressive scaling
    if (this.sprintManager.isAutoSprintEnabled) {
      const curSprint = this.sprintManager.currentSprint;
      const target = curSprint.targetScore * this.sprintManager.currentLoopMultiplier;
      const progressRatio = Math.min(1, this.score / (target || 1));
      this.currentSpeed = curSprint.minSpeed + (curSprint.maxSpeed - curSprint.minSpeed) * progressRatio;
    } else {
      const curSprint = this.sprintManager.currentSprint;
      this.currentSpeed = curSprint.minSpeed + (curSprint.maxSpeed - curSprint.minSpeed) * 0.5;
    }

    this.score += 1;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
    }

    if (this.score % 500 === 0) {
      soundEngine.playMilestone();
    }

    if (this.score % 250 === 0) {
      this.vuaConnector.evaluateEvolutionaryProgress(
        this.currentGeneration,
        this.score,
        this.bestScore,
        this.sprintManager.currentSprintIndex,
        this.environmentEvolution.currentEpoch.name,
        this.score >= this.bestScore && this.score > 200
      );
    }

    // Emit Epoch-specific atmospheric particles
    if (Math.random() < 0.28) {
      this.emitEpochAmbientParticles();
    }

    // 4D Hyperspace Rotation & Chrono History buffer
    this.tesseractAngleXW = (this.tesseractAngleXW + 0.016) % (Math.PI * 2);
    this.tesseractAngleYW = (this.tesseractAngleYW + 0.022) % (Math.PI * 2);
    this.tesseractAngleZW = (this.tesseractAngleZW + 0.013) % (Math.PI * 2);

    if (this.championDino && this.championDino.isAlive) {
      this.chronoHistory.unshift({
        time: Date.now(),
        x: this.championDino.x,
        y: this.championDino.y,
        isDucking: this.championDino.isDucking,
        isJumping: this.championDino.isJumping,
        color: this.championDino.color,
      });
      if (this.chronoHistory.length > 25) {
        this.chronoHistory.pop();
      }
    }

    // Grid scrolling
    this.gridOffset = (this.gridOffset + this.currentSpeed) % 40;

    // Obstacle Spawner controlled by Architect AI
    this.nextObstacleTimer -= 1;
    if (this.nextObstacleTimer <= 0) {
      const newObs = this.architectAI.generateNextObstacle(
        this.width + 20,
        this.groundY,
        this.currentSpeed
      );
      this.obstacles.push(...newObs);

      // Next spawn interval adapts to speed & architect aggression
      const threatMod = Math.max(0.65, 1.0 - this.architectAI.threatLevel * 0.06);
      const minDistance = Math.max(70, Math.floor((220 / this.currentSpeed) * 3.8 * threatMod));
      const variation = Math.floor(Math.random() * 50);
      this.nextObstacleTimer = minDistance + variation;
    }

    // Move obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.currentSpeed * obs.speedMultiplier;

      // Check if passed dino
      if (!obs.passed && obs.x + obs.width < 60) {
        obs.passed = true;
        this.gymStepInfo.lastReward = 2.0;
        this.gymStepInfo.episodeReward += 2.0;
        this.virtualFlyBrain.triggerRewardEvent(this.score);
      }

      // Remove offscreen
      if (obs.x + obs.width < -50) {
        this.obstacles.splice(i, 1);
      }
    }

    // Step reward accumulation in Gym environment
    this.gymStepInfo.stepCount++;
    this.gymStepInfo.episodeReward += 0.1;
    this.gymStepInfo.lastReward = 0.1;

    // Find nearest upcoming obstacle for AI inputs
    const upcoming = this.obstacles
      .filter((o) => o.x + o.width > 50)
      .sort((a, b) => a.x - b.x);
    const nearestObs = upcoming[0] || null;
    const secondObs = upcoming[1] || null;

    // Build Computer Vision Perception Buffer (Detected Entities & Saliency Map)
    const detected: VisionPerception['detectedEntities'] = [];
    const saliency: VisionPerception['saliencyPoints'] = [];

    if (this.championDino && this.championDino.isAlive) {
      detected.push({
        label: 'DINO_RUNNER',
        bbox: [this.championDino.x, this.championDino.y, this.championDino.width, this.championDino.height],
        confidence: 0.994,
      });
    }

    for (const obs of upcoming.slice(0, 3)) {
      const conf = Number((0.96 + (1 - Math.min(1, obs.x / 800)) * 0.038).toFixed(3));
      detected.push({
        label: obs.type.replace('_', ' ').toUpperCase(),
        bbox: [obs.x, obs.y, obs.width, obs.height],
        confidence: conf,
      });

      // Spatial Attention focus peak on leading edge of obstacle
      saliency.push({
        x: obs.x + obs.width / 2,
        y: obs.y + obs.height / 2,
        intensity: Math.max(0.3, 1 - (obs.x - 60) / 450),
      });
    }

    this.cvPerception.detectedEntities = detected;
    this.cvPerception.saliencyPoints = saliency;

    let aliveCount = 0;
    let highestScoringAlive: Dino | null = null;

    // Update Dinos
    for (const dino of this.dinos) {
      if (!dino.isAlive) continue;

      aliveCount++;
      dino.score = this.score;

      // Compute AI decision or human controls
      if (this.mode === 'tri_ai') {
        this.evaluateDinoBrain(dino, nearestObs, secondObs);
      } else {
        // Human player
        if (this.humanJumpRequested && !dino.isJumping) {
          dino.vy = this.jumpStrength;
          dino.isJumping = true;
          dino.jumpCount++;
          dino.lastAction = 'JUMP';
          soundEngine.playJump();
          this.emitSparks(dino.x + 10, dino.y + dino.height, '#38bdf8', 6);
        }

        dino.isDucking = this.humanDuckRequested;
        if (dino.isDucking && !dino.isJumping) {
          dino.lastAction = 'DUCK';
        } else if (!dino.isJumping) {
          dino.lastAction = 'RUN';
        }
      }

      // Physics integration
      if (dino.isJumping) {
        // Fast fall when ducking in mid-air
        const effectiveGravity = dino.isDucking ? this.gravity * 2.2 : this.gravity;
        dino.y += dino.vy;
        dino.vy += effectiveGravity;

        // Ground landing
        if (dino.y >= this.groundY - dino.height) {
          dino.y = this.groundY - dino.height;
          dino.vy = 0;
          dino.isJumping = false;
        }
      } else {
        dino.y = this.groundY - dino.height;
      }

      // Duck hitbox & visual dimensions
      if (dino.isDucking) {
        dino.height = 30;
        dino.width = 54;
        dino.y = this.groundY - 30;
      } else {
        dino.height = 48;
        dino.width = 44;
      }

      // Collision detection against obstacles
      for (const obs of this.obstacles) {
        if (this.checkCollision(dino, obs)) {
          dino.isAlive = false;
          dino.fitness = dino.score + dino.jumpCount * 2 + dino.duckCount * 3;
          aliveCount--;

          // Biocomputing feedback to Drosophila connectome
          if (dino === this.championDino || dino.id === 0) {
            this.virtualFlyBrain.triggerCollisionPenalty();
          }

          // Notify Architect AI of collision physics
          this.architectAI.recordDeath(
            obs,
            this.currentSpeed,
            this.groundY - dino.y,
            dino.vy,
            dino.isDucking
          );

          this.emitExplosion(dino.x + dino.width / 2, dino.y + dino.height / 2, dino.color);
          soundEngine.playCrash();

          if (this.mode !== 'tri_ai') {
            this.screenShake = 12;
          }
          break;
        }
      }

      if (dino.isAlive && (!highestScoringAlive || dino.score > highestScoringAlive.score)) {
        highestScoringAlive = dino;
      }
    }

    if (highestScoringAlive) {
      this.championDino = highestScoringAlive;
    }

    this.generationStats.aliveCount = aliveCount;
    this.generationStats.currentBestScore = this.score;

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Running dust particles from leading dino
    if (this.championDino && this.championDino.isAlive && !this.championDino.isJumping && Math.random() < 0.35) {
      this.emitSparks(this.championDino.x - 4, this.groundY - 2, '#64748b', 1);
    }

    // Check Extinction in Tri-AI mode
    if (this.mode === 'tri_ai' && aliveCount === 0) {
      this.handleGenerationExtinction();
    }
  }

  private evaluateDinoBrain(
    dino: Dino,
    nearestObs: Obstacle | null,
    secondObs: Obstacle | null
  ): void {
    // Normalize inputs into neural network:
    // 0: Distance to nearest obs (0 = imminent, 1 = max sight ~600px)
    // 1: Obstacle width (norm / 80)
    // 2: Obstacle height (norm / 60)
    // 3: Obstacle Y-altitude (0 = on ground, 1 = high in sky)
    // 4: Distance to 2nd obstacle (lookahead)
    // 5: Dino current Y normalized from ground (0 = ground, 1 = max jump)
    // 6: Dino vertical velocity (norm / 15)
    // 7: Current game speed (norm / 20)

    const maxSight = 500;
    const dist1 = nearestObs ? Math.max(0, nearestObs.x - (dino.x + dino.width)) : maxSight;
    const dist2 = secondObs ? Math.max(0, secondObs.x - (dino.x + dino.width)) : maxSight;

    const inputs = [
      Math.min(1.0, dist1 / maxSight),
      nearestObs ? nearestObs.width / 80 : 0,
      nearestObs ? nearestObs.height / 60 : 0,
      nearestObs ? Math.max(0, (this.groundY - (nearestObs.y + nearestObs.height)) / 90) : 0,
      Math.min(1.0, dist2 / maxSight),
      Math.max(0, (this.groundY - (dino.y + dino.height)) / 120),
      dino.vy / 15,
      this.currentSpeed / 18,
    ];

    const outputs = dino.brain.feedForward(inputs);
    const jumpOut = outputs[0];
    const duckOut = outputs[1];
    const runOut = outputs[2];

    // Compute Softmax action probabilities for Gym Actor
    const maxVal = Math.max(runOut, jumpOut, duckOut);
    const expRun = Math.exp(runOut - maxVal);
    const expJump = Math.exp(jumpOut - maxVal);
    const expDuck = Math.exp(duckOut - maxVal);
    const sumExp = expRun + expJump + expDuck;

    const probRun = expRun / sumExp;
    const probJump = expJump / sumExp;
    const probDuck = expDuck / sumExp;

    dino.actionConfidence = Math.max(probRun, probJump, probDuck);
    dino.criticValue = Number((dino.score * 0.05 + dino.fitness * 0.02).toFixed(2));

    // Update global CV perception for leading Champion
    if (dino === this.championDino || dino.id === 0) {
      this.cvPerception.actionDistribution = {
        run: Number(probRun.toFixed(2)),
        jump: Number(probJump.toFixed(2)),
        duck: Number(probDuck.toFixed(2)),
      };
      this.cvPerception.criticValueEstimate = dino.criticValue;
      this.cvPerception.opticalFlowSpeed = Number(this.currentSpeed.toFixed(1));
    }

    // VirtualFlyBrain Drosophila Connectome evaluation for Champion / Leading Dino
    if (dino === this.championDino || dino.id === 0) {
      const oW = nearestObs ? nearestObs.width : 20;
      const oH = nearestObs ? nearestObs.height : 20;
      const oAlt = nearestObs ? Math.max(0, this.groundY - (nearestObs.y + nearestObs.height)) : 0;
      const vfbDecision = this.virtualFlyBrain.processSensoryTick(
        dist1,
        oW,
        oH,
        oAlt,
        this.currentSpeed,
        dino.y,
        dino.isJumping
      );

      // If Giant Fiber emergency reflex is triggered, execute immediate reflex jump!
      if (vfbDecision.giantFiberSpike && !dino.isJumping) {
        dino.vy = this.jumpStrength;
        dino.isJumping = true;
        dino.jumpCount++;
        dino.lastAction = 'JUMP';
        this.emitSparks(dino.x + 12, dino.y + dino.height, '#ef4444', 8);
        if (dino === this.championDino) this.gymStepInfo.actionTaken = 1;
        soundEngine.playJump();
        return;
      }
    }

    // Decision logic
    if (jumpOut > 0.55 && jumpOut > duckOut && !dino.isJumping) {
      dino.vy = this.jumpStrength;
      dino.isJumping = true;
      dino.jumpCount++;
      dino.lastAction = 'JUMP';
      if (dino === this.championDino) this.gymStepInfo.actionTaken = 1;
      if (dino.id === 0) soundEngine.playJump();
    } else if (duckOut > 0.52 && duckOut > jumpOut) {
      dino.isDucking = true;
      dino.duckCount++;
      dino.lastAction = 'DUCK';
      if (dino === this.championDino) this.gymStepInfo.actionTaken = 2;
      if (dino.id === 0 && !dino.isJumping && Math.random() < 0.1) soundEngine.playDuck();
    } else {
      dino.isDucking = false;
      dino.lastAction = 'RUN';
      if (dino === this.championDino) this.gymStepInfo.actionTaken = 0;
    }
  }

  private checkCollision(dino: Dino, obs: Obstacle): boolean {
    // Generous bounding box padding to avoid unfair pixel-edge collisions
    const padX = 6;
    const padY = 4;

    const dLeft = dino.x + padX;
    const dRight = dino.x + dino.width - padX;
    const dTop = dino.y + padY;
    const dBottom = dino.y + dino.height - padY;

    const oLeft = obs.x + padX;
    const oRight = obs.x + obs.width - padX;
    const oTop = obs.y + padY;
    const oBottom = obs.y + obs.height - padY;

    return dRight > oLeft && dLeft < oRight && dBottom > oTop && dTop < oBottom;
  }

  private handleGenerationExtinction(): void {
    // Evolve new generation via Optimizer AI
    const result = this.optimizerAI.evolvePopulation(
      this.dinos,
      this.populationSize,
      this.groundY,
      44,
      48
    );

    this.generationStats.history.unshift({
      generation: this.currentGeneration,
      bestScore: result.bestScore,
      avgScore: result.avgScore,
      threatTier: this.architectAI.threatLevel,
    });
    if (this.generationStats.history.length > 15) {
      this.generationStats.history.pop();
    }

    this.currentGeneration++;
    this.generationStats.generation = this.currentGeneration;
    this.generationStats.bestScore = Math.max(this.generationStats.bestScore, result.bestScore);
    this.dinos = result.newPopulation;
    this.championDino = this.dinos[0];

    // Reset obstacle field & score
    this.obstacles = [];
    this.score = 0;
    this.currentSpeed = this.baseSpeed;
    this.nextObstacleTimer = 90;

    soundEngine.playEvolutionChime();
  }

  public emitSparks(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: -(this.currentSpeed * 0.4) + (Math.random() * 2 - 1),
        vy: (Math.random() * 2 - 1) * 1.5,
        color,
        size: Math.random() * 2.5 + 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 12 + 8),
      });
    }
  }

  public emitExplosion(x: number, y: number, color: string): void {
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color: Math.random() < 0.6 ? color : '#f43f5e',
        size: Math.random() * 3.5 + 1.5,
        life: 0,
        maxLife: Math.floor(Math.random() * 24 + 14),
      });
    }
  }

  public emitEpochAmbientParticles(): void {
    const epoch = this.environmentEvolution.currentEpoch;
    const pType = epoch.ambientParticles;

    if (pType === 'volcanic_ash') {
      this.particles.push({
        x: Math.random() * this.width,
        y: this.groundY - Math.random() * 45,
        vx: (Math.random() - 0.5) * 1.5 - this.currentSpeed * 0.2,
        vy: -(Math.random() * 1.8 + 0.6),
        color: Math.random() < 0.65 ? '#f97316' : '#ea580c',
        size: Math.random() * 2.5 + 1.0,
        life: 0,
        maxLife: 40,
      });
    } else if (pType === 'neon_rain') {
      this.particles.push({
        x: Math.random() * this.width,
        y: 0,
        vx: -1.2,
        vy: Math.random() * 6 + 6,
        color: Math.random() < 0.5 ? '#38bdf8' : '#f43f5e',
        size: Math.random() * 2 + 1,
        life: 0,
        maxLife: 35,
      });
    } else if (pType === 'martian_dust') {
      this.particles.push({
        x: this.width,
        y: this.groundY - Math.random() * 80,
        vx: -(this.currentSpeed * 0.8 + Math.random() * 3),
        vy: (Math.random() - 0.5) * 1.4,
        color: '#fb7185',
        size: Math.random() * 2.2 + 0.8,
        life: 0,
        maxLife: 45,
      });
    } else if (pType === 'quantum_fluctuations') {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 2.5,
        vy: (Math.random() - 0.5) * 2.5,
        color: Math.random() < 0.5 ? '#10b981' : '#34d399',
        size: Math.random() * 2.8 + 1.2,
        life: 0,
        maxLife: 22,
      });
    } else if (pType === 'relativistic_plasma') {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.groundY * 0.8),
        vx: -(this.currentSpeed * 0.4 + Math.random() * 2.5),
        vy: (Math.random() - 0.5) * 3,
        color: Math.random() < 0.5 ? '#eab308' : '#c084fc',
        size: Math.random() * 3 + 1.5,
        life: 0,
        maxLife: 30,
      });
    }
  }

  public render(): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();

    // Screen Shake effect
    if (this.screenShake > 0) {
      const dx = (Math.random() * 2 - 1) * this.screenShake;
      const dy = (Math.random() * 2 - 1) * this.screenShake;
      ctx.translate(dx, dy);
      this.screenShake *= 0.82;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // Render Scene according to Dimensional Environment (2D Vector, 3D Perspective Track, or 4D Tesseract)
    if (this.dimension === '3d') {
      DimensionalRenderer.render3DScene(this, ctx, w, h);
    } else if (this.dimension === '4d') {
      DimensionalRenderer.render4DScene(this, ctx, w, h);
    } else {
      this.render2DScene(ctx, w, h);
    }

    // Computer Vision Perception Overlays (IA Jogadora)
    if (this.dimension !== '3d') {
      if (this.showVisionHeatmap) {
        this.renderVisionHeatmap(ctx);
      }
      if (this.showBoundingBoxes) {
        this.renderBoundingBoxes(ctx);
      }
    }

    // Automated Difficulty Sprint Progress HUD (Top-Center Pill)
    DimensionalRenderer.renderSprintHUD(ctx, this.sprintManager.getState(), w, h);

    // Pop-up Sprint Milestone or Dimension Shift Banner Notification
    DimensionalRenderer.renderSprintBanner(ctx, this.sprintManager.bannerNotification, w, h);

    // Top & Score HUD
    this.renderHUD(ctx, w, h);

    ctx.restore();
  }

  private render2DScene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const epoch = this.environmentEvolution.currentEpoch;

    // 1. Background gradient dynamically adapting to Evolutionary Planetary Epoch
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, epoch.skyGradients[0]);
    bgGrad.addColorStop(0.35, epoch.skyGradients[1]);
    bgGrad.addColorStop(0.7, epoch.skyGradients[2]);
    bgGrad.addColorStop(1, epoch.skyGradients[3]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Parallax Cyber Horizon Monoliths
    this.renderHorizonMonoliths(ctx, w, h);

    // 3. Ground with Perspective Neon Cyber Grid
    this.renderCyberGrid(ctx, w, h);

    // 4. Trajectory Guide from Optimizer AI (in Tri-AI or Co-Pilot mode)
    if (this.championDino && this.championDino.isAlive) {
      const tactics = this.optimizerAI.computeOptimalTactics(
        this.championDino,
        this.obstacles,
        this.currentSpeed,
        this.groundY,
        this.gravity,
        this.jumpStrength
      );
      this.renderTrajectoryGuide(ctx, tactics);
    }

    // 5. Render Obstacles (Quantum Cacti & Cyber Pterodactyls & EMP Hazards)
    this.renderObstacles(ctx);

    // 6. Render Dinos (Ghost runners + Champion)
    this.renderDinos(ctx);

    // 7. Render Particles
    this.renderParticles(ctx);
  }

  private renderHorizonMonoliths(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.fillStyle = '#0f172a88';
    const monoliths = [
      { x: 120, w: 50, h: 90 },
      { x: 230, w: 80, h: 140 },
      { x: 420, w: 40, h: 70 },
      { x: 580, w: 90, h: 120 },
      { x: 740, w: 60, h: 95 },
    ];

    for (const m of monoliths) {
      const px = (m.x - (this.gridOffset * 0.25) + w) % w;
      ctx.fillRect(px, this.groundY - m.h, m.w, m.h);

      // Monolith beacon line
      ctx.strokeStyle = '#0284c722';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, this.groundY - m.h, m.w, m.h);
    }
  }

  private renderCyberGrid(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const epoch = this.environmentEvolution.currentEpoch;
    const gy = this.groundY;

    // Solid Neon Horizon Divider matching epoch horizon glow
    ctx.strokeStyle = epoch.horizonGlow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();

    // Ground glow
    ctx.shadowColor = epoch.horizonGlow;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = epoch.railColors.center;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Moving vertical perspective lines under ground
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    for (let x = -this.gridOffset; x < w; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x - 24, h);
      ctx.stroke();
    }

    // Horizontal lines under ground
    for (let y = gy + 14; y < h; y += 16) {
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  private renderTrajectoryGuide(ctx: CanvasRenderingContext2D, tactics: any): void {
    if (!tactics.trajectoryPoints || tactics.trajectoryPoints.length < 2) return;

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;

    if (tactics.dangerLevel > 70) {
      ctx.strokeStyle = '#f43f5e'; // Warning red
      ctx.shadowColor = '#f43f5e';
    } else {
      ctx.strokeStyle = '#10b981'; // Safe green
      ctx.shadowColor = '#10b981';
    }
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(tactics.trajectoryPoints[0].x, tactics.trajectoryPoints[0].y);
    for (let i = 1; i < tactics.trajectoryPoints.length; i++) {
      ctx.lineTo(tactics.trajectoryPoints[i].x, tactics.trajectoryPoints[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Action indicator icon
    if (this.mode === 'copilot' && tactics.optimalNextAction !== 'RUN') {
      const dino = this.championDino;
      if (dino) {
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = tactics.optimalNextAction === 'JUMP' ? '#38bdf8' : '#fbbf24';
        ctx.fillText(`⚡ ${tactics.optimalNextAction}!`, dino.x - 6, dino.y - 14);
      }
    }

    ctx.restore();
  }

  private renderObstacles(ctx: CanvasRenderingContext2D): void {
    for (const obs of this.obstacles) {
      ctx.save();

      if (obs.type.startsWith('cactus')) {
        // Quantum Neon Cactus
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#059669';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;

        // Draw segmented energy crystal cactus
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        // Core pulsating neon channel
        ctx.fillStyle = '#a7f3d0';
        ctx.fillRect(obs.x + obs.width / 2 - 2, obs.y + 4, 4, obs.height - 8);

        // Warning tag above high hazard obstacles
        if (obs.hazardRating >= 7) {
          ctx.fillStyle = '#f43f5e';
          ctx.font = '9px monospace';
          ctx.fillText(`▲ T${obs.hazardRating}`, obs.x, obs.y - 4);
        }
      } else if (obs.type.startsWith('pterodactyl')) {
        // Cyber-Pterodactyl / Avian Drone
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 9;
        ctx.fillStyle = '#be185d';
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.5;

        const wingFlap = Math.sin(Date.now() * 0.015) * 8;

        // Fuselage
        ctx.beginPath();
        ctx.ellipse(
          obs.x + obs.width / 2,
          obs.y + obs.height / 2,
          obs.width / 2 - 2,
          obs.height / 3,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        // Wings
        ctx.beginPath();
        ctx.moveTo(obs.x + 8, obs.y + obs.height / 2);
        ctx.lineTo(obs.x + obs.width / 2, obs.y + wingFlap);
        ctx.lineTo(obs.x + obs.width - 8, obs.y + obs.height / 2);
        ctx.stroke();

        // Visor Laser Eye
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(obs.x + 4, obs.y + obs.height / 2 - 2, 6, 4);
      } else if (obs.type === 'emp_hazard') {
        // Electromagnetic Pulse Hazard Node
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;

        const pulse = Math.sin(Date.now() * 0.012) * 3;
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;

        // Outer pulsing hazard ring
        ctx.beginPath();
        ctx.arc(cx, cy, obs.width / 2 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = '#7e22ce';
        ctx.beginPath();
        ctx.arc(cx, cy, obs.width / 3, 0, Math.PI * 2);
        ctx.fill();

        // Hazard icon glyph
        ctx.fillStyle = '#f0abfc';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('⚡', cx - 5, cy + 4);
      }

      ctx.restore();
    }
  }

  private renderDinos(ctx: CanvasRenderingContext2D): void {
    // Sort so alive and champion render on top of dead/ghosts
    const sorted = [...this.dinos].sort((a, b) => (a.isAlive ? 1 : 0) - (b.isAlive ? 1 : 0));

    for (const dino of sorted) {
      if (!dino.isAlive && this.mode === 'tri_ai') continue; // Hide dead dinos in population

      const isLeader = dino === this.championDino;
      const alpha = isLeader ? 1.0 : 0.35;

      ctx.save();
      ctx.globalAlpha = alpha;

      this.drawCyberDino(ctx, dino, isLeader);

      ctx.restore();
    }
  }

  private drawCyberDino(ctx: CanvasRenderingContext2D, dino: Dino, isLeader: boolean): void {
    DinoRenderer.drawDinosaur(ctx, dino, isLeader, this.currentSpeed, 1.0);
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.save();
      const alpha = 1 - p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    }
  }

  private renderVisionHeatmap(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    // Render spatial attention hotspots on upcoming obstacles
    for (const point of this.cvPerception.saliencyPoints) {
      const radius = 55 * point.intensity;
      const gradient = ctx.createRadialGradient(point.x, point.y, 4, point.x, point.y, radius);
      gradient.addColorStop(0, 'rgba(244, 63, 94, 0.45)'); // Core high attention
      gradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.25)'); // Medium attention
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)'); // Falloff

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderBoundingBoxes(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const entity of this.cvPerception.detectedEntities) {
      const [bx, by, bw, bh] = entity.bbox;
      const isDino = entity.label.includes('DINO');
      const boxColor = isDino ? '#38bdf8' : '#34d399';

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(bx - 2, by - 2, bw + 4, bh + 4);
      ctx.setLineDash([]);

      // Corner Crosshair brackets
      const cornerSize = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(bx - 3, by + cornerSize);
      ctx.lineTo(bx - 3, by - 3);
      ctx.lineTo(bx + cornerSize, by - 3);
      ctx.stroke();

      // Label Chip
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(bx - 2, by - 16, Math.max(70, bw + 4), 13);
      ctx.fillStyle = boxColor;
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText(`${entity.label} ${(entity.confidence * 100).toFixed(0)}%`, bx, by - 6);
    }
    ctx.restore();
  }

  public toggleVisionHeatmap(): boolean {
    this.showVisionHeatmap = !this.showVisionHeatmap;
    return this.showVisionHeatmap;
  }

  public toggleBoundingBoxes(): boolean {
    this.showBoundingBoxes = !this.showBoundingBoxes;
    return this.showBoundingBoxes;
  }

  private renderHUD(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save();

    // Top-Left: Gym Environment Observation Tensor & Actor Action Distribution
    ctx.font = '10px monospace';
    ctx.fillStyle = '#0f172ae6';
    ctx.fillRect(10, 10, 270, 48);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 270, 48);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`GYM ENV OBS: (4, 84, 84) | REWARD: +${this.gymStepInfo.episodeReward.toFixed(1)}`, 16, 24);

    const dist = this.cvPerception.actionDistribution;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`ACTOR π: `, 16, 40);
    ctx.fillStyle = '#10b981';
    ctx.fillText(`R:${Math.round(dist.run * 100)}% `, 75, 40);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`J:${Math.round(dist.jump * 100)}% `, 125, 40);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`D:${Math.round(dist.duck * 100)}%`, 175, 40);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`CRITIC V(s): +${this.cvPerception.criticValueEstimate.toFixed(2)}`, 16, 52);

    // Epoch & Drosophila connectome status banner in top-center
    const epoch = this.environmentEvolution.currentEpoch;
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#0f172ae6';
    ctx.fillRect(w / 2 - 135, 10, 270, 24);
    ctx.strokeStyle = epoch.badgeColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(w / 2 - 135, 10, 270, 24);

    ctx.fillStyle = epoch.badgeColor;
    ctx.textAlign = 'center';
    const gfActive = this.virtualFlyBrain.state.giantFiberTriggered;
    ctx.fillText(
      `ÉPOCA: ${epoch.name.toUpperCase()} (g=${epoch.gravity}g) | VFB: ${gfActive ? '⚡GF ESCAPE' : 'ONLINE'}`,
      w / 2,
      25
    );
    ctx.textAlign = 'left';

    // Score Board
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('HI ', w - 210, 32);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(String(this.bestScore).padStart(5, '0'), w - 180, 32);

    ctx.fillStyle = '#f8fafc';
    ctx.fillText(' ' + String(this.score).padStart(5, '0'), w - 110, 32);

    // Speed and Dimension mode display
    ctx.font = '11px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`VEL: ${this.currentSpeed.toFixed(1)} px/f`, w - 110, 50);
    ctx.fillStyle = this.dimension === '4d' ? '#c084fc' : this.dimension === '3d' ? '#38bdf8' : '#34d399';
    ctx.fillText(`DIM: ${this.dimension.toUpperCase()}`, w - 190, 50);

    // Human Mode Game Over prompt
    if (this.mode !== 'tri_ai' && this.humanDino && !this.humanDino.isAlive) {
      ctx.fillStyle = '#0f172ae6';
      ctx.fillRect(w / 2 - 160, h / 2 - 40, 320, 80);
      ctx.strokeStyle = '#f43f5e';
      ctx.strokeRect(w / 2 - 160, h / 2 - 40, 320, 80);

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SYSTEM OVERRIDE: COLLISION', w / 2, h / 2 - 10);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText('Press SPACE or UP to Reboot', w / 2, h / 2 + 18);
    }

    ctx.restore();
  }

  public destroy(): void {
    this.stop();
  }
}
