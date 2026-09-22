import { DifficultySprint, ObstacleType, SprintState } from '../types/game';

export const DIFFICULTY_SPRINTS: DifficultySprint[] = [
  {
    id: 1,
    title: 'Sprint 1: Calibração Cinemática',
    subtitle: 'Aquecimento reflexivo & curva parabólica',
    targetScore: 400,
    minSpeed: 7.0,
    maxSpeed: 8.5,
    threatTier: 1,
    architectStrategy: 'PROBING_BASELINE',
    hazardMix: ['cactus_small', 'cactus_double'],
    description: 'Calibração básica de impulsão gravitacional e tempos de reação contra cactos individuais.',
    badgeColor: '#10b981', // Emerald
  },
  {
    id: 2,
    title: 'Sprint 2: Emboscada Aérea & Agachamento',
    subtitle: 'Intercepção de baixa altitude & drones',
    targetScore: 900,
    minSpeed: 8.6,
    maxSpeed: 10.5,
    threatTier: 2,
    architectStrategy: 'LOW_AIR_AMBUSH',
    hazardMix: ['pterodactyl_low', 'pterodactyl_mid', 'cactus_small'],
    description: 'A IA Criadora força decisões binárias rápidas entre salto e agachamento aerodinâmico.',
    badgeColor: '#06b6d4', // Cyan
  },
  {
    id: 3,
    title: 'Sprint 3: Compressão Temporal & Combos',
    subtitle: 'Janelas mínimas de reação & cactos triplos',
    targetScore: 1600,
    minSpeed: 10.6,
    maxSpeed: 12.8,
    threatTier: 3,
    architectStrategy: 'COMBO_AMBUSH',
    hazardMix: ['cactus_triple', 'pterodactyl_mid', 'pterodactyl_high', 'cactus_double'],
    description: 'Sequências de obstáculos em rápida sucessão exigindo timing preditivo milimétrico.',
    badgeColor: '#f59e0b', // Amber
  },
  {
    id: 4,
    title: 'Sprint 4: Surto Quântico Hiperveloz',
    subtitle: 'Cinemática supersônica & pulso EMP',
    targetScore: 2400,
    minSpeed: 12.9,
    maxSpeed: 15.2,
    threatTier: 4,
    architectStrategy: 'HIGH_VELOCITY_STRESS',
    hazardMix: ['emp_hazard', 'cactus_triple', 'pterodactyl_low', 'cactus_double'],
    description: 'Velocidades extremas (>13 px/f) onde o tempo de reflexo humano é superado pela IA.',
    badgeColor: '#f43f5e', // Rose
  },
  {
    id: 5,
    title: 'Sprint 5: Singularidade Neural WGAN-GP',
    subtitle: 'Cluster adversarial de máxima entropia',
    targetScore: 3500,
    minSpeed: 15.3,
    maxSpeed: 18.0,
    threatTier: 5,
    architectStrategy: 'ADVERSARIAL_LATENT_CLUSTER',
    hazardMix: ['emp_hazard', 'cactus_triple', 'pterodactyl_low', 'pterodactyl_mid'],
    description: 'Fronteira extrema de co-evolução: padrões adversariais com tolerância de 1 frame.',
    badgeColor: '#a855f7', // Purple
  },
];

export class SprintManager {
  public currentSprintIndex: number = 0;
  public isAutoSprintEnabled: boolean = true;
  public sprintScoreProgress: number = 0;
  public sprintsCompletedCount: number = 0;
  public currentLoopMultiplier: number = 1.0;

  public bannerNotification: {
    message: string;
    submessage: string;
    timestamp: number;
    duration: number;
  } | null = null;

  public get currentSprint(): DifficultySprint {
    return DIFFICULTY_SPRINTS[this.currentSprintIndex] || DIFFICULTY_SPRINTS[0];
  }

  public getState(): SprintState {
    return {
      currentSprintIndex: this.currentSprintIndex,
      currentSprint: this.currentSprint,
      isAutoSprintEnabled: this.isAutoSprintEnabled,
      sprintScoreProgress: this.sprintScoreProgress,
      sprintsCompletedCount: this.sprintsCompletedCount,
      bannerNotification: this.bannerNotification,
    };
  }

  public update(score: number): {
    didAdvance: boolean;
    completedSprint?: DifficultySprint;
    newSprint?: DifficultySprint;
  } {
    // Clean expired banner
    if (this.bannerNotification && Date.now() - this.bannerNotification.timestamp > this.bannerNotification.duration) {
      this.bannerNotification = null;
    }

    if (!this.isAutoSprintEnabled) {
      return { didAdvance: false };
    }

    const current = this.currentSprint;
    const target = Math.round(current.targetScore * this.currentLoopMultiplier);

    this.sprintScoreProgress = Math.min(score, target);

    if (score >= target) {
      const completed = current;
      this.sprintsCompletedCount++;

      // Advance to next sprint or loop back with multiplier
      if (this.currentSprintIndex < DIFFICULTY_SPRINTS.length - 1) {
        this.currentSprintIndex++;
      } else {
        // Completed all sprints! Overdrive mode
        this.currentSprintIndex = 0;
        this.currentLoopMultiplier += 0.35;
      }

      const next = this.currentSprint;

      this.bannerNotification = {
        message: `🏆 ${completed.title} CONCLUÍDO!`,
        submessage: `Iniciando ${next.title} (Velocidade: ${next.minSpeed.toFixed(1)}-${next.maxSpeed.toFixed(1)} px/f)`,
        timestamp: Date.now(),
        duration: 3800,
      };

      return {
        didAdvance: true,
        completedSprint: completed,
        newSprint: next,
      };
    }

    return { didAdvance: false };
  }

  public setSprint(index: number): DifficultySprint {
    this.currentSprintIndex = Math.max(0, Math.min(DIFFICULTY_SPRINTS.length - 1, index));
    const next = this.currentSprint;

    this.bannerNotification = {
      message: `⚡ SPRINT SELECIONADO: ${next.title}`,
      submessage: `${next.subtitle} | Tier ${next.threatTier}`,
      timestamp: Date.now(),
      duration: 2500,
    };

    return next;
  }

  public toggleAutoSprint(): boolean {
    this.isAutoSprintEnabled = !this.isAutoSprintEnabled;
    this.bannerNotification = {
      message: this.isAutoSprintEnabled ? '🚀 Sprints Automáticos: ATIVADOS' : '⏸️ Sprints Automáticos: MANUAL',
      submessage: this.isAutoSprintEnabled
        ? 'Dificuldade irá evoluir automaticamente por marcos de pontuação.'
        : 'Sprint fixo selecionado. Você pode alternar os sprints manualmente.',
      timestamp: Date.now(),
      duration: 2200,
    };
    return this.isAutoSprintEnabled;
  }

  public reset(): void {
    this.currentSprintIndex = 0;
    this.sprintScoreProgress = 0;
    this.currentLoopMultiplier = 1.0;
    this.bannerNotification = null;
  }
}
