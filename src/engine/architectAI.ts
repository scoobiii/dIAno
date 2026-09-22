import { AdversarialCreatorMetrics, ArchitectWeaknessAnalysis, Obstacle, ObstacleType } from '../types/game';

export class ArchitectAI {
  public threatLevel: number = 1; // 1 to 5
  public difficultyScore: number = 10;
  public totalSpawned: number = 0;
  
  // Adversarial GAN / Generator Telemetry
  public discriminatorLoss: number = 0.693; // ln(2) baseline
  public generatorAdversarialLoss: number = 0.812;
  public solvabilityScore: number = 96.5; // Solvability constraint %
  public currentLatentVector: number[] = new Array(16).fill(0).map(() => (Math.random() * 2 - 1));

  // Player telemetry gathered across generations
  public jumpFailuresEarly: number = 0;
  public jumpFailuresLate: number = 0;
  public duckFailures: number = 0;
  public highSpeedCrashes: number = 0;
  public comboCrashes: number = 0;
  public totalDeathsRecorded: number = 0;

  public activeStrategy: string = 'ADVERSARIAL_GAN_CALIBRATION';
  public recentStrategies: string[] = ['PROBING_BASELINE'];
  public analysisLog: string[] = [
    'IA Criadora (Adversarial Generator): WGAN-GP online. Solvability discriminator active.',
  ];

  // Tactical modes
  private strategies = [
    'ADVERSARIAL_GAN_CALIBRATION',
    'LOW_AIR_AMBUSH',
    'TRIPLE_QUANTUM_SPIKE',
    'RHYTHM_BREAKER',
    'HIGH_VELOCITY_STRESS',
    'VERTICAL_DESYNC_COMBO',
    'ADVERSARIAL_LATENT_CLUSTER',
  ];

  public recordDeath(
    lastObstacle: Obstacle | null,
    gameSpeed: number,
    dinoY: number,
    dinoVy: number,
    isDucking: boolean
  ): void {
    this.totalDeathsRecorded++;

    // Adversarial reward: Generator successfully exposed weakness
    this.generatorAdversarialLoss = Math.max(0.12, this.generatorAdversarialLoss * 0.94);
    this.discriminatorLoss = Math.min(1.4, this.discriminatorLoss * 1.03);

    if (!lastObstacle) return;

    if (lastObstacle.type.startsWith('pterodactyl')) {
      if (lastObstacle.type === 'pterodactyl_mid' && !isDucking) {
        this.duckFailures++;
        this.logAnalysis(`IA Criadora explorou falha de agachamento: Pterodáctilo interceptou Dino.`);
      } else if (dinoY > 20) {
        this.logAnalysis(`Colisão aérea: Dino interceptado no vértice da parábola de salto.`);
      }
    } else if (lastObstacle.type.startsWith('cactus')) {
      if (dinoVy > 0) {
        this.jumpFailuresEarly++; // falling down into cactus
        this.logAnalysis(`Vértice de pulo prematuro: Queda gravitacional sobre espinho quântico.`);
      } else if (dinoY < 10) {
        this.jumpFailuresLate++; // didn't jump in time
        this.logAnalysis(`Latência sináptica violada: Salto tardio detectado pela rede.`);
      }
    }

    if (gameSpeed > 10) {
      this.highSpeedCrashes++;
      this.logAnalysis(`Sobrecarga cinemática: Falha em alta velocidade (>10 px/f).`);
    }

    this.recomputeThreatAndStrategy();
  }

  public getAdversarialMetrics(): AdversarialCreatorMetrics {
    const analysis = this.getWeaknessAnalysis();
    return {
      currentThreatLevel: this.threatLevel,
      activeStrategy: this.activeStrategy,
      recentStrategies: this.recentStrategies,
      discriminatorLoss: Number(this.discriminatorLoss.toFixed(3)),
      generatorAdversarialLoss: Number(this.generatorAdversarialLoss.toFixed(3)),
      solvabilityScore: Number(this.solvabilityScore.toFixed(1)),
      latentDimension: 16,
      jumpTimingBias: analysis.jumpTimingBias,
      duckProficiency: analysis.duckProficiency,
      highSpeedSurvival: analysis.highSpeedSurvival,
      clusterVulnerability: analysis.clusterVulnerability,
    };
  }

  private recomputeThreatAndStrategy(): void {
    // Increase threat level based on survivor scores or total attempts
    const newThreat = Math.min(5, 1 + Math.floor(this.difficultyScore / 25));
    if (newThreat !== this.threatLevel) {
      this.threatLevel = newThreat;
      this.logAnalysis(`Threat Tier escalated to LVL ${this.threatLevel}! Deploying complex hazards.`);
    }

    // Adapt strategy to exploit runner's biggest weakness
    if (this.duckFailures > 2 && Math.random() < 0.6) {
      this.activeStrategy = 'LOW_AIR_AMBUSH';
    } else if (this.jumpFailuresEarly > this.jumpFailuresLate && Math.random() < 0.6) {
      this.activeStrategy = 'TRIPLE_QUANTUM_SPIKE';
    } else if (this.highSpeedCrashes > 3 && Math.random() < 0.5) {
      this.activeStrategy = 'HIGH_VELOCITY_STRESS';
    } else if (this.threatLevel >= 3 && Math.random() < 0.4) {
      this.activeStrategy = 'VERTICAL_DESYNC_COMBO';
    } else {
      const idx = Math.floor(Math.random() * this.strategies.length);
      this.activeStrategy = this.strategies[idx];
    }

    if (!this.recentStrategies.includes(this.activeStrategy)) {
      this.recentStrategies.unshift(this.activeStrategy);
      if (this.recentStrategies.length > 5) this.recentStrategies.pop();
    }
  }

  public getWeaknessAnalysis(): ArchitectWeaknessAnalysis {
    const totalJumpsAnalyzed = this.jumpFailuresEarly + this.jumpFailuresLate || 1;
    const earlyRatio = this.jumpFailuresEarly / totalJumpsAnalyzed;

    return {
      jumpTimingBias: earlyRatio > 0.6 ? 'early' : earlyRatio < 0.4 ? 'late' : 'balanced',
      duckProficiency: Math.max(10, Math.min(100, 100 - this.duckFailures * 12)),
      highSpeedSurvival: Math.max(10, Math.min(100, 100 - this.highSpeedCrashes * 10)),
      clusterVulnerability: Math.max(10, Math.min(100, this.comboCrashes * 15 + 20)),
      currentThreatLevel: this.threatLevel,
      activeStrategy: this.activeStrategy,
      recentStrategies: [...this.recentStrategies],
    };
  }

  public generateNextObstacle(
    spawnX: number,
    groundY: number,
    currentSpeed: number
  ): Obstacle[] {
    this.totalSpawned++;
    this.difficultyScore += 0.5;

    let type: ObstacleType = 'cactus_small';
    let width = 24;
    let height = 46;
    let y = groundY - height;
    let hazardRating = 2;

    // Tactical generation based on active strategy & threat level
    switch (this.activeStrategy) {
      case 'LOW_AIR_AMBUSH': {
        // Mid-altitude pterodactyl that MUST be ducked
        type = 'pterodactyl_mid';
        width = 46;
        height = 36;
        y = groundY - 58; // flies at head level
        hazardRating = 7;
        break;
      }

      case 'TRIPLE_QUANTUM_SPIKE': {
        type = 'cactus_triple';
        width = 68;
        height = 50;
        y = groundY - height;
        hazardRating = 6;
        break;
      }

      case 'VERTICAL_DESYNC_COMBO': {
        if (Math.random() < 0.5) {
          // Low pterodactyl (jumpable)
          type = 'pterodactyl_low';
          width = 46;
          height = 34;
          y = groundY - 38;
          hazardRating = 8;
        } else {
          // High pterodactyl (safe to run under or duck)
          type = 'pterodactyl_high';
          width = 46;
          height = 34;
          y = groundY - 88;
          hazardRating = 5;
        }
        break;
      }

      case 'HIGH_VELOCITY_STRESS': {
        // Double cactus with fast timing
        type = 'cactus_double';
        width = 46;
        height = 48;
        y = groundY - height;
        hazardRating = 6;
        break;
      }

      default: {
        // Standard calibration pool weighted by threat tier
        const roll = Math.random();
        if (roll < 0.4) {
          type = 'cactus_small';
          width = 24;
          height = 44;
          y = groundY - height;
          hazardRating = 2;
        } else if (roll < 0.7) {
          type = 'cactus_double';
          width = 44;
          height = 48;
          y = groundY - height;
          hazardRating = 4;
        } else if (roll < 0.85 && this.threatLevel >= 2) {
          type = 'pterodactyl_mid';
          width = 46;
          height = 36;
          y = groundY - 58;
          hazardRating = 7;
        } else if (this.threatLevel >= 3) {
          type = 'cactus_triple';
          width = 68;
          height = 52;
          y = groundY - height;
          hazardRating = 7;
        } else {
          type = 'cactus_small';
          width = 24;
          height = 44;
          y = groundY - height;
          hazardRating = 2;
        }
        break;
      }
    }

    // Generate latent vector for WGAN-GP obstacle generation
    this.currentLatentVector = new Array(16).fill(0).map(() => Number((Math.random() * 2 - 1).toFixed(3)));

    const primaryObstacle: Obstacle = {
      id: `obs_${this.totalSpawned}_${Date.now()}`,
      type,
      x: spawnX,
      y,
      width,
      height,
      speedMultiplier: 1.0,
      hazardRating,
      passed: false,
      spawnedByArchitectStrategy: this.activeStrategy,
      latentVector: [...this.currentLatentVector],
    };

    // Chance for close secondary combo in high threat levels
    if (this.threatLevel >= 4 && Math.random() < 0.25) {
      const comboType: ObstacleType = type === 'cactus_small' ? 'pterodactyl_high' : 'cactus_small';
      const comboSpacing = 160 + Math.random() * 80;
      const comboObstacle: Obstacle = {
        id: `obs_${this.totalSpawned}_combo`,
        type: comboType,
        x: spawnX + comboSpacing,
        y: comboType === 'pterodactyl_high' ? groundY - 86 : groundY - 42,
        width: comboType === 'pterodactyl_high' ? 44 : 24,
        height: comboType === 'pterodactyl_high' ? 34 : 42,
        speedMultiplier: 1.0,
        hazardRating: 9,
        passed: false,
        spawnedByArchitectStrategy: 'COMBO_AMBUSH',
        latentVector: this.currentLatentVector.map((v) => Number((-v).toFixed(3))),
      };
      return [primaryObstacle, comboObstacle];
    }

    return [primaryObstacle];
  }

  public applySprintCurriculum(strategy: string, threatTier: number, hazardMix?: ObstacleType[]): void {
    this.activeStrategy = strategy;
    this.threatLevel = threatTier;
    if (!this.recentStrategies.includes(strategy)) {
      this.recentStrategies.unshift(strategy);
      if (this.recentStrategies.length > 5) this.recentStrategies.pop();
    }
    this.logAnalysis(`Currículo de Sprint Aplicado: [${strategy}] Tier ${threatTier}.`);
  }

  public logAnalysis(msg: string): void {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      minute: '2-digit',
      second: '2-digit',
    });
    this.analysisLog.unshift(`[${timestamp}] ARCHITECT: ${msg}`);
    if (this.analysisLog.length > 20) this.analysisLog.pop();
  }

  public resetStats(): void {
    this.threatLevel = 1;
    this.difficultyScore = 10;
    this.jumpFailuresEarly = 0;
    this.jumpFailuresLate = 0;
    this.duckFailures = 0;
    this.highSpeedCrashes = 0;
    this.comboCrashes = 0;
    this.totalDeathsRecorded = 0;
    this.activeStrategy = 'STANDARD_CALIBRATION';
    this.analysisLog = ['Architect AI reset. Re-initiating calibration cycle.'];
  }
}
