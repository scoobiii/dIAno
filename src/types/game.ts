import type { NeuralNetwork } from '../engine/neuralNetwork';

export type GameMode = 'tri_ai' | 'human_vs_ai' | 'copilot';

export type DimensionMode = '2d' | '3d' | '4d';

export interface DifficultySprint {
  id: number;
  title: string;
  subtitle: string;
  targetScore: number;
  minSpeed: number;
  maxSpeed: number;
  threatTier: number;
  architectStrategy: string;
  hazardMix: ObstacleType[];
  description: string;
  badgeColor: string;
}

export interface SprintState {
  currentSprintIndex: number;
  currentSprint: DifficultySprint;
  isAutoSprintEnabled: boolean;
  sprintScoreProgress: number;
  sprintsCompletedCount: number;
  bannerNotification: {
    message: string;
    submessage: string;
    timestamp: number;
    duration: number;
  } | null;
}

export interface ChronoGhost {
  x: number;
  y: number;
  isDucking: boolean;
  isJumping: boolean;
  color: string;
  temporalOffset: number; // e.g. -4, -8, -12 frames
}

export type ObstacleType = 'cactus_small' | 'cactus_double' | 'cactus_triple' | 'pterodactyl_low' | 'pterodactyl_mid' | 'pterodactyl_high' | 'emp_hazard';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  speedMultiplier: number;
  hazardRating: number; // 1 to 10
  passed: boolean;
  spawnedByArchitectStrategy?: string;
  latentVector?: number[]; // Generator latent z-code
}

export interface VisionPerception {
  processedFrameWidth: number;
  processedFrameHeight: number;
  frameStackDepth: number; // 4 frames stacked
  detectedEntities: {
    label: string;
    bbox: [number, number, number, number]; // [x, y, w, h]
    confidence: number;
  }[];
  saliencyPoints: { x: number; y: number; intensity: number }[];
  opticalFlowSpeed: number;
  criticValueEstimate: number; // V(s)
  actionDistribution: {
    run: number;
    jump: number;
    duck: number;
  };
}

export interface Dino {
  id: number;
  isAlive: boolean;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  isJumping: boolean;
  isDucking: boolean;
  score: number;
  fitness: number;
  brain: NeuralNetwork;
  color: string;
  jumpCount: number;
  duckCount: number;
  lastAction: 'JUMP' | 'DUCK' | 'RUN';
  actionConfidence: number;
  criticValue?: number;
}

export interface NeuralLayer {
  weights: number[][]; // [fromNeuron][toNeuron]
  biases: number[];
}

export interface NeuralNetworkState {
  inputs: number[];
  hidden1: number[];
  hidden2: number[];
  outputs: number[];
}

export interface AdversarialCreatorMetrics {
  currentThreatLevel: number; // 1 to 5
  activeStrategy: string;
  recentStrategies: string[];
  discriminatorLoss: number;
  generatorAdversarialLoss: number;
  solvabilityScore: number; // 0 to 100%
  latentDimension: number;
  jumpTimingBias: 'early' | 'late' | 'balanced';
  duckProficiency: number;
  highSpeedSurvival: number;
  clusterVulnerability: number;
}

export interface HybridPPOGeneticMetrics {
  policyLoss: number;
  valueLoss: number;
  entropyLoss: number;
  approxKL: number;
  clipFraction: number;
  advantageMean: number;
  mutationRate: number;
  crossoverPairs: number;
  breakthroughLogs: string[];
  recentAdaptations: string[];
  optimalNextAction: 'JUMP' | 'DUCK' | 'RUN';
  dangerLevel: number;
  predictedSurvivalChance: number;
  trajectoryPoints: { x: number; y: number }[];
}

export interface GymStepInfo {
  stepCount: number;
  episodeReward: number;
  lastReward: number;
  actionTaken: number; // 0: RUN, 1: JUMP, 2: DUCK
  isTruncated: boolean;
  isTerminated: boolean;
  fps: number;
}

export interface ArchitectWeaknessAnalysis {
  jumpTimingBias: 'early' | 'late' | 'balanced';
  duckProficiency: number;
  highSpeedSurvival: number;
  clusterVulnerability: number;
  currentThreatLevel: number;
  activeStrategy: string;
  recentStrategies: string[];
}

export interface OptimizerTactics {
  optimalNextAction: 'JUMP' | 'DUCK' | 'RUN';
  recommendedJumpFrameDist: number;
  dangerLevel: number;
  predictedSurvivalChance: number;
  trajectoryPoints: { x: number; y: number }[];
  breakthroughLogs: string[];
  recentAdaptations: string[];
}

export interface GenerationStats {
  generation: number;
  bestScore: number;
  currentBestScore: number;
  aliveCount: number;
  populationSize: number;
  averageFitness: number;
  history: {
    generation: number;
    bestScore: number;
    avgScore: number;
    threatTier: number;
  }[];
}
