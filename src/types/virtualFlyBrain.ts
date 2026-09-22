/**
 * VirtualFlyBrain (VFB) Connectomics Types
 * Inspired by Drosophila melanogaster connectome architectures (VirtualFlyBrain.org)
 */

export interface NeuropilRegion {
  id: string;
  name: string;
  acronym: string;
  anatomicalClass: 'visual' | 'central_complex' | 'mushroom_body' | 'motor_descending' | 'sensory';
  description: string;
  neuronCount: number;
  firingRateHz: number; // 0 to 120 Hz
  activityLevel: number; // 0 to 1 normalized
  color: string;
  x: number; // Anatomical coordinate in normalized 3D/2D space (0..100)
  y: number;
  z: number;
}

export interface ConnectomeSynapse {
  id: string;
  sourceNeuropilId: string;
  targetNeuropilId: string;
  neurotransmitter: 'dopamine' | 'octopamine' | 'gaba' | 'acetylcholine';
  weight: number; // -1.0 to 1.0
  plasticityRate: number;
  spikeActive: boolean;
}

export interface NeurotransmitterLevels {
  dopamine: number; // Reward / associative reinforcement (0..100%)
  octopamine: number; // Arousal / speed response (0..100%)
  gaba: number; // Inhibitory brake / noise filter (0..100%)
  acetylcholine: number; // Fast excitatory neuromuscular drive (0..100%)
}

export interface VirtualFlyBrainState {
  neuropils: NeuropilRegion[];
  synapses: ConnectomeSynapse[];
  neurotransmitters: NeurotransmitterLevels;
  totalSpikesEmitted: number;
  giantFiberTriggered: boolean; // Reflex escape jump
  mushroomBodyValence: number; // Positive = approach/run, Negative = avoid/hazard
  centralComplexHeadingDeg: number; // Ring attractor vector 0..360
  loomingVisualThreat: number; // Looming expansion rate from Optic Lobe
  plasticityEventsCount: number;
  activeRecommendation: 'RUN' | 'JUMP' | 'DUCK';
  confidence: number;
}
