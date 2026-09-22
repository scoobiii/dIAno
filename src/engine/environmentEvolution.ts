export type EnvironmentEpochId =
  | 'cretaceous'
  | 'cyberpunk_2027'
  | 'martian_2088'
  | 'quantum_void'
  | 'dyson_singularity';

export interface EnvironmentEpoch {
  id: EnvironmentEpochId;
  name: string;
  eraSubtitle: string;
  description: string;
  threatMultiplier: number;
  gravity: number; // Modifies standard physics
  jumpStrength: number;
  speedModifier: number;
  skyGradients: [string, string, string, string];
  groundColor: string;
  horizonGlow: string;
  railColors: {
    left: string;
    center: string;
    right: string;
  };
  ambientParticles: 'volcanic_ash' | 'neon_rain' | 'martian_dust' | 'quantum_fluctuations' | 'relativistic_plasma';
  visualFlavor: string;
  badgeColor: string;
  milestoneGeneration: number;
}

export const EVOLUTIONARY_EPOCHS: EnvironmentEpoch[] = [
  {
    id: 'cretaceous',
    name: 'Cretáceo Primordial',
    eraSubtitle: '66 Ma a.C. — Idade dos Dinossauros',
    description: 'Vulcões primordiais ativos, cinzas quentes na atmosfera e vegetação fóssil. Gravidade padrão terrestre.',
    threatMultiplier: 1.0,
    gravity: 0.68,
    jumpStrength: -12.4,
    speedModifier: 1.0,
    skyGradients: ['#1c1008', '#381a0e', '#7c2d12', '#9a3412'],
    groundColor: '#1e130c',
    horizonGlow: '#f97316',
    railColors: {
      left: '#ea580c',
      center: '#f59e0b',
      right: '#fbbf24',
    },
    ambientParticles: 'volcanic_ash',
    visualFlavor: 'Cinzas vulcânicas & horizonte em brasa',
    badgeColor: '#f97316',
    milestoneGeneration: 1,
  },
  {
    id: 'cyberpunk_2027',
    name: 'Neo-Tokyo 2027',
    eraSubtitle: 'Metrópole Cibernética Sintética',
    description: 'Chuva ácida de neon, outdoors holográficos, fiação de alta tensão e asfalto molhado refletivo.',
    threatMultiplier: 1.15,
    gravity: 0.70,
    jumpStrength: -12.5,
    speedModifier: 1.06,
    skyGradients: ['#040714', '#09132e', '#1e1b4b', '#3b0764'],
    groundColor: '#070b16',
    horizonGlow: '#06b6d4',
    railColors: {
      left: '#f43f5e',
      center: '#38bdf8',
      right: '#06b6d4',
    },
    ambientParticles: 'neon_rain',
    visualFlavor: 'Chuva ácida vertical & reflexos cromáticos',
    badgeColor: '#06b6d4',
    milestoneGeneration: 4,
  },
  {
    id: 'martian_2088',
    name: 'Biosfera Marciana 2088',
    eraSubtitle: 'Terraformação do Planeta Vermelho',
    description: 'Céus de óxido de ferro, domos geodésicos e gravidade reduzida (0.46g). Saltos longos e flutuantes!',
    threatMultiplier: 1.3,
    gravity: 0.46, // Low Martian gravity!
    jumpStrength: -10.2, // Floaty parabolic arcs
    speedModifier: 1.12,
    skyGradients: ['#1c0808', '#2e0f0f', '#551717', '#881337'],
    groundColor: '#180909',
    horizonGlow: '#f43f5e',
    railColors: {
      left: '#fb7185',
      center: '#f43f5e',
      right: '#fda4af',
    },
    ambientParticles: 'martian_dust',
    visualFlavor: 'Microgravidade 0.46g & tempestade de areia vermelha',
    badgeColor: '#f43f5e',
    milestoneGeneration: 8,
  },
  {
    id: 'quantum_void',
    name: 'Matriz Quântica Planck',
    eraSubtitle: 'Dimensão de Subcordas & Vácuo',
    description: 'Teias de supercordas vibrantes, fissuras temporais e micro-oscilações anti-gravitacionais.',
    threatMultiplier: 1.5,
    gravity: 0.56,
    jumpStrength: -11.5,
    speedModifier: 1.2,
    skyGradients: ['#040d12', '#052329', '#064e3b', '#047857'],
    groundColor: '#031417',
    horizonGlow: '#10b981',
    railColors: {
      left: '#10b981',
      center: '#34d399',
      right: '#6ee7b7',
    },
    ambientParticles: 'quantum_fluctuations',
    visualFlavor: 'Fissuras quânticas & entrelaçamento espacial',
    badgeColor: '#10b981',
    milestoneGeneration: 13,
  },
  {
    id: 'dyson_singularity',
    name: 'Enxame Dyson Omega',
    eraSubtitle: 'Horizonte de Eventos & Kardashev II',
    description: 'Arco coronal de estrela de nêutrons, anéis de Dyson e alta gravidade relativística com dilatação Lorentz.',
    threatMultiplier: 1.8,
    gravity: 0.82, // High relativistic gravity!
    jumpStrength: -13.8, // Heavy kinetic thrust required
    speedModifier: 1.28,
    skyGradients: ['#080210', '#190626', '#3b0764', '#581c87'],
    groundColor: '#0c0416',
    horizonGlow: '#eab308',
    railColors: {
      left: '#eab308',
      center: '#c084fc',
      right: '#a855f7',
    },
    ambientParticles: 'relativistic_plasma',
    visualFlavor: 'Lentes gravitacionais & radiação de Hawking',
    badgeColor: '#eab308',
    milestoneGeneration: 19,
  },
];

export class EnvironmentEvolutionManager {
  public currentEpochIndex: number = 0;
  public isAutoEpochEvolution: boolean = true;
  public totalEpochTransitions: number = 0;

  public get currentEpoch(): EnvironmentEpoch {
    return EVOLUTIONARY_EPOCHS[this.currentEpochIndex] || EVOLUTIONARY_EPOCHS[0];
  }

  public setEpoch(index: number): EnvironmentEpoch {
    this.currentEpochIndex = Math.max(0, Math.min(EVOLUTIONARY_EPOCHS.length - 1, index));
    this.totalEpochTransitions++;
    return this.currentEpoch;
  }

  public setEpochById(id: EnvironmentEpochId): EnvironmentEpoch {
    const idx = EVOLUTIONARY_EPOCHS.findIndex((e) => e.id === id);
    if (idx !== -1) {
      return this.setEpoch(idx);
    }
    return this.currentEpoch;
  }

  public toggleAutoEvolution(): boolean {
    this.isAutoEpochEvolution = !this.isAutoEpochEvolution;
    return this.isAutoEpochEvolution;
  }

  public getState(): {
    currentEpochIndex: number;
    currentEpoch: EnvironmentEpoch;
    isAutoEvolutionEnabled: boolean;
  } {
    return {
      currentEpochIndex: this.currentEpochIndex,
      currentEpoch: this.currentEpoch,
      isAutoEvolutionEnabled: this.isAutoEpochEvolution,
    };
  }

  /**
   * Evaluates if generation or score triggers environmental epoch transition
   */
  public evaluateEvolution(currentGeneration: number, sprintIndex: number): EnvironmentEpoch | null {
    if (!this.isAutoEpochEvolution) return null;

    let targetEpochIndex = 0;
    for (let i = EVOLUTIONARY_EPOCHS.length - 1; i >= 0; i--) {
      if (currentGeneration >= EVOLUTIONARY_EPOCHS[i].milestoneGeneration || sprintIndex >= i) {
        targetEpochIndex = i;
        break;
      }
    }

    if (targetEpochIndex !== this.currentEpochIndex) {
      this.currentEpochIndex = targetEpochIndex;
      this.totalEpochTransitions++;
      return this.currentEpoch;
    }

    return null;
  }
}
