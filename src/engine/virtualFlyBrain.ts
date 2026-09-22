import {
  NeuropilRegion,
  ConnectomeSynapse,
  NeurotransmitterLevels,
  VirtualFlyBrainState,
} from '../types/virtualFlyBrain';

/**
 * VirtualFlyBrain Connectome Engine
 * Biologically realistic Drosophila melanogaster neural connectome model
 * Inspired by Drosophila connectomics and VirtualFlyBrain.org open neuroscience.
 */
export class VirtualFlyBrainEngine {
  public neuropils: NeuropilRegion[] = [];
  public synapses: ConnectomeSynapse[] = [];
  public neurotransmitters: NeurotransmitterLevels = {
    dopamine: 45,
    octopamine: 50,
    gaba: 40,
    acetylcholine: 65,
  };

  public totalSpikesEmitted: number = 0;
  public giantFiberTriggered: boolean = false;
  public mushroomBodyValence: number = 0.5; // 0..1
  public centralComplexHeadingDeg: number = 90;
  public loomingVisualThreat: number = 0;
  public plasticityEventsCount: number = 0;

  public activeRecommendation: 'RUN' | 'JUMP' | 'DUCK' = 'RUN';
  public confidence: number = 0.5;

  private frameCount: number = 0;

  constructor() {
    this.initConnectomeTopology();
  }

  /**
   * Initializes the core anatomical neuropils and connectome wiring
   * based on the Drosophila hemibrain / VFB standard brain atlas
   */
  private initConnectomeTopology(): void {
    this.neuropils = [
      // 1. Optic Lobes (Sensory Vision & Looming Detectors)
      {
        id: 'me_optic',
        name: 'Medulla Optica (ME)',
        acronym: 'ME',
        anatomicalClass: 'visual',
        description: 'Processamento retinotópico primário e filtragem espacial de alto contraste.',
        neuronCount: 40000,
        firingRateHz: 35,
        activityLevel: 0.3,
        color: '#38bdf8', // Sky Cyan
        x: 18,
        y: 35,
        z: 10,
      },
      {
        id: 'lo_lobula',
        name: 'Lobula Plate (LP/LO)',
        acronym: 'LP',
        anatomicalClass: 'visual',
        description: 'Detectores de movimento elementar (T4/T5) e expansão de ameaça visual rápida (looming).',
        neuronCount: 15000,
        firingRateHz: 42,
        activityLevel: 0.4,
        color: '#06b6d4', // Cyan
        x: 28,
        y: 48,
        z: 15,
      },

      // 2. Central Complex (CX - Spatial Orientation, Ring Attractor & Action Steering)
      {
        id: 'eb_ellipsoid',
        name: 'Ellipsoid Body (EB)',
        acronym: 'EB',
        anatomicalClass: 'central_complex',
        description: 'Rede de anel atrator (E-PG) que calcula a bússola interna e a distância angular do perigo.',
        neuronCount: 3200,
        firingRateHz: 28,
        activityLevel: 0.35,
        color: '#a855f7', // Purple
        x: 50,
        y: 42,
        z: 25,
      },
      {
        id: 'fb_fanshaped',
        name: 'Fan-Shaped Body (FB)',
        acronym: 'FB',
        anatomicalClass: 'central_complex',
        description: 'Matriz colunar de integração multissensorial para seleção de estado comportamental.',
        neuronCount: 4800,
        firingRateHz: 30,
        activityLevel: 0.32,
        color: '#c084fc', // Light Purple
        x: 50,
        y: 28,
        z: 22,
      },
      {
        id: 'pb_bridge',
        name: 'Protocerebral Bridge (PB)',
        acronym: 'PB',
        anatomicalClass: 'central_complex',
        description: 'Ponte protocerebral bilateral com 16 glomérulos para sincronização motora.',
        neuronCount: 2400,
        firingRateHz: 25,
        activityLevel: 0.28,
        color: '#818cf8', // Indigo
        x: 50,
        y: 18,
        z: 18,
      },

      // 3. Mushroom Body (MB - Associative Memory & Plasticity)
      {
        id: 'kc_kenyon',
        name: 'Kenyon Cells (MB-KC)',
        acronym: 'KC',
        anatomicalClass: 'mushroom_body',
        description: 'População de representação esparsa (~2.000 neurônios) para codificação de contexto.',
        neuronCount: 2500,
        firingRateHz: 12,
        activityLevel: 0.2,
        color: '#fbbf24', // Amber
        x: 72,
        y: 32,
        z: 20,
      },
      {
        id: 'mbon_output',
        name: 'Mushroom Body Output (MBON)',
        acronym: 'MBON',
        anatomicalClass: 'mushroom_body',
        description: 'Neurônios de eferência do corpo cogumelo com valência de aproximação vs evitação.',
        neuronCount: 68,
        firingRateHz: 48,
        activityLevel: 0.45,
        color: '#f59e0b', // Deep Amber
        x: 80,
        y: 45,
        z: 22,
      },
      {
        id: 'dan_dopamine',
        name: 'Dopaminergic Neurons (DAN)',
        acronym: 'DAN',
        anatomicalClass: 'mushroom_body',
        description: 'Sinalizadores de recompensa e punição modulando plasticidade sináptica por reforço.',
        neuronCount: 180,
        firingRateHz: 22,
        activityLevel: 0.38,
        color: '#fb7185', // Rose
        x: 75,
        y: 60,
        z: 18,
      },

      // 4. Sensory Antennal/Mechanosensory Lobe
      {
        id: 'al_antennal',
        name: 'Antennal Mechanolobe (AL)',
        acronym: 'AL',
        anatomicalClass: 'sensory',
        description: 'Receptores proprioceptivos do fluxo de vento atmosférico e oscilações do solo.',
        neuronCount: 3500,
        firingRateHz: 20,
        activityLevel: 0.25,
        color: '#34d399', // Emerald
        x: 35,
        y: 72,
        z: 5,
      },

      // 5. Descending Escape Motor Circuit
      {
        id: 'gf_giantfiber',
        name: 'Giant Fiber System (GF / DNp01)',
        acronym: 'GF',
        anatomicalClass: 'motor_descending',
        description: 'Via de escape de ultra-baixa latência (<4ms). Disparo tudo-ou-nada para salto de evasão imediato.',
        neuronCount: 2,
        firingRateHz: 5,
        activityLevel: 0.1,
        color: '#ef4444', // Red Alert
        x: 50,
        y: 85,
        z: 30,
      },
      {
        id: 'dn_flexor',
        name: 'Descending Interneurons (DN-Flex)',
        acronym: 'DN',
        anatomicalClass: 'motor_descending',
        description: 'Controle de flexão postural e abaixamento aerodinâmico (ducking) para desvio rasteiro.',
        neuronCount: 120,
        firingRateHz: 18,
        activityLevel: 0.22,
        color: '#f97316', // Orange
        x: 62,
        y: 80,
        z: 25,
      },
    ];

    // Synaptic Wiring
    this.synapses = [
      {
        id: 'me_to_lp',
        sourceNeuropilId: 'me_optic',
        targetNeuropilId: 'lo_lobula',
        neurotransmitter: 'acetylcholine',
        weight: 0.85,
        plasticityRate: 0.02,
        spikeActive: true,
      },
      {
        id: 'lp_to_eb',
        sourceNeuropilId: 'lo_lobula',
        targetNeuropilId: 'eb_ellipsoid',
        neurotransmitter: 'acetylcholine',
        weight: 0.78,
        plasticityRate: 0.04,
        spikeActive: false,
      },
      {
        id: 'lp_to_gf',
        sourceNeuropilId: 'lo_lobula',
        targetNeuropilId: 'gf_giantfiber',
        neurotransmitter: 'acetylcholine',
        weight: 0.92,
        plasticityRate: 0.01,
        spikeActive: false,
      },
      {
        id: 'eb_to_fb',
        sourceNeuropilId: 'eb_ellipsoid',
        targetNeuropilId: 'fb_fanshaped',
        neurotransmitter: 'gaba',
        weight: 0.65,
        plasticityRate: 0.03,
        spikeActive: false,
      },
      {
        id: 'fb_to_pb',
        sourceNeuropilId: 'fb_fanshaped',
        targetNeuropilId: 'pb_bridge',
        neurotransmitter: 'acetylcholine',
        weight: 0.72,
        plasticityRate: 0.02,
        spikeActive: false,
      },
      {
        id: 'kc_to_mbon',
        sourceNeuropilId: 'kc_kenyon',
        targetNeuropilId: 'mbon_output',
        neurotransmitter: 'acetylcholine',
        weight: 0.60,
        plasticityRate: 0.08,
        spikeActive: false,
      },
      {
        id: 'dan_to_kc',
        sourceNeuropilId: 'dan_dopamine',
        targetNeuropilId: 'kc_kenyon',
        neurotransmitter: 'dopamine',
        weight: 0.75,
        plasticityRate: 0.09,
        spikeActive: false,
      },
      {
        id: 'fb_to_dn',
        sourceNeuropilId: 'fb_fanshaped',
        targetNeuropilId: 'dn_flexor',
        neurotransmitter: 'octopamine',
        weight: 0.68,
        plasticityRate: 0.05,
        spikeActive: false,
      },
      {
        id: 'al_to_eb',
        sourceNeuropilId: 'al_antennal',
        targetNeuropilId: 'eb_ellipsoid',
        neurotransmitter: 'octopamine',
        weight: 0.55,
        plasticityRate: 0.03,
        spikeActive: false,
      },
      {
        id: 'mbon_to_fb',
        sourceNeuropilId: 'mbon_output',
        targetNeuropilId: 'fb_fanshaped',
        neurotransmitter: 'gaba',
        weight: 0.70,
        plasticityRate: 0.06,
        spikeActive: false,
      },
    ];
  }

  /**
   * Processes sensory inputs from game physics and returns biological spike response
   */
  public processSensoryTick(
    distObstacle: number,
    obstacleWidth: number,
    obstacleHeight: number,
    obstacleAltitude: number, // 0 = ground, >0 = flying
    speed: number,
    dinoY: number,
    isJumping: boolean
  ): {
    recommendation: 'RUN' | 'JUMP' | 'DUCK';
    confidence: number;
    giantFiberSpike: boolean;
    activeNeuropils: string[];
  } {
    this.frameCount++;

    // 1. Calculate Looming Visual Threat (Optical Expansion Rate)
    // Formula: Theta_dot = (speed * size) / (dist^2)
    const effectiveDist = Math.max(12, distObstacle);
    const loomingRate = (speed * obstacleWidth) / (effectiveDist * 1.5);
    this.loomingVisualThreat = Math.min(1.0, loomingRate * 0.12);

    // 2. Optic Lobe Activity
    const meNeuropil = this.neuropils.find((n) => n.id === 'me_optic');
    const lpNeuropil = this.neuropils.find((n) => n.id === 'lo_lobula');
    if (meNeuropil) {
      meNeuropil.activityLevel = Math.min(1, 0.2 + (speed / 18) * 0.6);
      meNeuropil.firingRateHz = Math.round(20 + meNeuropil.activityLevel * 70);
    }
    if (lpNeuropil) {
      lpNeuropil.activityLevel = this.loomingVisualThreat;
      lpNeuropil.firingRateHz = Math.round(15 + this.loomingVisualThreat * 95);
    }

    // 3. Central Complex - Ring Attractor heading
    const ebNeuropil = this.neuropils.find((n) => n.id === 'eb_ellipsoid');
    const fbNeuropil = this.neuropils.find((n) => n.id === 'fb_fanshaped');
    if (ebNeuropil) {
      // Heading shifts as obstacle approaches
      const angle = (distObstacle / 800) * 180;
      this.centralComplexHeadingDeg = Math.round(angle);
      ebNeuropil.activityLevel = Math.min(1, 0.3 + (1 - distObstacle / 600) * 0.7);
    }

    // 4. Mushroom Body - Associative Memory & Valence
    const kcNeuropil = this.neuropils.find((n) => n.id === 'kc_kenyon');
    const mbonNeuropil = this.neuropils.find((n) => n.id === 'mbon_output');
    if (kcNeuropil && mbonNeuropil) {
      // Kenyon cells sparse activation based on height/altitude combination
      kcNeuropil.activityLevel = (obstacleHeight + obstacleAltitude) / 120;
      // MBON computes avoidance valence (high danger when close)
      this.mushroomBodyValence = Math.max(0, 1 - distObstacle / 280);
      mbonNeuropil.activityLevel = this.mushroomBodyValence;
    }

    // 5. Giant Fiber (GF / DNp01) Escape Reflex Trigger
    // Emergency escape jump occurs when looming visual expansion exceeds 0.75 and obstacle is ground-based
    const gfNeuropil = this.neuropils.find((n) => n.id === 'gf_giantfiber');
    const dnNeuropil = this.neuropils.find((n) => n.id === 'dn_flexor');

    const isGroundObstacle = obstacleAltitude < 15;
    const isMidAirObstacle = obstacleAltitude >= 15 && obstacleAltitude < 50;

    let decision: 'RUN' | 'JUMP' | 'DUCK' = 'RUN';
    let decisionConfidence = 0.5;
    let gfSpike = false;

    // Time-to-contact estimate (frames)
    const timeToContact = distObstacle / Math.max(0.1, speed);

    if (distObstacle < 240) {
      if (isGroundObstacle) {
        // Jump required
        if (timeToContact < 16 && !isJumping) {
          gfSpike = true;
          decision = 'JUMP';
          decisionConfidence = 0.95;
          this.totalSpikesEmitted += 12;
        } else if (timeToContact < 24 && !isJumping) {
          decision = 'JUMP';
          decisionConfidence = 0.82;
        }
      } else if (isMidAirObstacle) {
        // Duck required (flying pterodactyl at head height)
        if (timeToContact < 22) {
          decision = 'DUCK';
          decisionConfidence = 0.91;
          if (dnNeuropil) dnNeuropil.activityLevel = 0.88;
        }
      }
    }

    if (gfNeuropil) {
      gfNeuropil.activityLevel = gfSpike ? 1.0 : Math.max(0.05, gfNeuropil.activityLevel * 0.85);
      gfNeuropil.firingRateHz = gfSpike ? 110 : 8;
    }

    // 6. Neurotransmitter Balance Updates
    this.neurotransmitters.octopamine = Math.min(100, Math.round(35 + (speed / 18) * 45 + this.loomingVisualThreat * 20));
    this.neurotransmitters.acetylcholine = Math.min(100, Math.round(40 + (gfSpike ? 55 : 20)));
    this.neurotransmitters.gaba = Math.min(100, Math.round(30 + (1 - this.loomingVisualThreat) * 35));

    // Dynamic Synapse Spikes
    for (const syn of this.synapses) {
      if (syn.sourceNeuropilId === 'lo_lobula' && this.loomingVisualThreat > 0.4) {
        syn.spikeActive = Math.random() < 0.6;
      } else if (syn.sourceNeuropilId === 'gf_giantfiber' && gfSpike) {
        syn.spikeActive = true;
      } else {
        syn.spikeActive = Math.random() < 0.15;
      }
    }

    this.giantFiberTriggered = gfSpike;
    this.activeRecommendation = decision;
    this.confidence = decisionConfidence;

    return {
      recommendation: decision,
      confidence: decisionConfidence,
      giantFiberSpike: gfSpike,
      activeNeuropils: this.neuropils.filter((n) => n.activityLevel > 0.4).map((n) => n.id),
    };
  }

  /**
   * Called on successful obstacle clearance - triggers Dopamine reward spike and synaptic STDP reinforcement
   */
  public triggerRewardEvent(obstacleScore: number): void {
    this.neurotransmitters.dopamine = Math.min(100, this.neurotransmitters.dopamine + 15);
    this.plasticityEventsCount++;

    // Strengthen positive Mushroom Body connections (Hebbian potentiation)
    for (const syn of this.synapses) {
      if (syn.sourceNeuropilId === 'kc_kenyon' || syn.targetNeuropilId === 'mbon_output') {
        syn.weight = Math.min(1.0, syn.weight + 0.02);
      }
    }

    const danNeuropil = this.neuropils.find((n) => n.id === 'dan_dopamine');
    if (danNeuropil) {
      danNeuropil.activityLevel = 0.95;
      danNeuropil.firingRateHz = 85;
    }
  }

  /**
   * Called on collision - triggers Dopamine drop, Octopamine surge, and synaptic depression
   */
  public triggerCollisionPenalty(): void {
    this.neurotransmitters.dopamine = Math.max(5, this.neurotransmitters.dopamine - 25);
    this.neurotransmitters.octopamine = Math.min(100, this.neurotransmitters.octopamine + 30);
    this.plasticityEventsCount++;

    // Synaptic depression
    for (const syn of this.synapses) {
      if (syn.neurotransmitter === 'dopamine') {
        syn.weight = Math.max(-0.5, syn.weight - 0.04);
      }
    }
  }

  public get state(): VirtualFlyBrainState {
    return this.getState();
  }

  public getState(): VirtualFlyBrainState {
    return {
      neuropils: this.neuropils,
      synapses: this.synapses,
      neurotransmitters: this.neurotransmitters,
      totalSpikesEmitted: this.totalSpikesEmitted,
      giantFiberTriggered: this.giantFiberTriggered,
      mushroomBodyValence: this.mushroomBodyValence,
      centralComplexHeadingDeg: this.centralComplexHeadingDeg,
      loomingVisualThreat: this.loomingVisualThreat,
      plasticityEventsCount: this.plasticityEventsCount,
      activeRecommendation: this.activeRecommendation,
      confidence: this.confidence,
    };
  }
}
