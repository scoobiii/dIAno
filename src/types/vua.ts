/**
 * Types for VUA (Vortex / Verified User Agent) Connector AI
 * Incorporating the VirtualFlyBrain connectome topology and Vortex Agent Governance Contract.
 * Authoritative target: https://github.com/scoobiii/vua
 */

export interface VortexEvidence {
  provider: 'github' | 'vua_runtime';
  authenticatedPrincipal: string;
  action: 'create_pr' | 'merge_pr' | 'deploy_gitpage' | 'validate_gates';
  target: string;
  baseSha: string;
  headSha: string;
  payloadHash: string;
  approvalBinding: string;
  remoteResponse: {
    status: number;
    code: string;
    message: string;
    timestamp: string;
    url?: string;
  };
  executionProof: string;
}

export interface VUAConnectomeDecision {
  neuropilSignals: {
    opticLobeSensory: number; // ME / LP input based on game metrics and code delta
    mushroomBodyValence: number; // MB / KC valuation: dopamine reward vs octopamine risk
    centralComplexAngle: number; // EB / FB steering: alignment with main branch & governance
    antennalSensorySmell: number; // AL input: code cleanliness and lint gate smell
    giantFiberSpike: boolean; // GF / DNp01 motor descending neuron firing
  };
  neurotransmitters: {
    dopamine: number; // Reward for high score / breakthrough
    octopamine: number; // Stress / regression danger
    gaba: number; // Inhibitory brake on unverified PRs
    acetylcholine: number; // Transmission velocity
  };
  decision: 'HOLD' | 'PROPOSE_PR' | 'AUTO_MERGE' | 'DISPATCH_PAGES' | 'FAIL_CLOSED';
  confidence: number;
  failClosedReason: string | null;
  gateChecks: {
    typeScriptLint: boolean;
    productionBuild: boolean;
    vfbConnectomeIntegrity: boolean;
    governanceBindingVerified: boolean;
  };
}

export interface VUAPullRequestRecord {
  id: string;
  prNumber: number;
  title: string;
  branch: string;
  baseBranch: string;
  state: 'open' | 'merged' | 'closed';
  mergeable: boolean;
  createdAt: string;
  mergedAt?: string;
  generation: number;
  scoreAchieved: number;
  epochName: string;
  evidence: VortexEvidence;
  prUrl: string;
  pagesUrl: string;
}

export interface VUAGitPageDeployment {
  deploymentId: string;
  status: 'queued' | 'in_progress' | 'active' | 'failure';
  commitSha: string;
  pageUrl: string;
  timestamp: string;
  environment: 'github-pages';
  evidenceProof: string;
}

export interface VUAGovernanceState {
  targetRepo: string; // e.g. "scoobiii/vua"
  activeBranch: string;
  lastKnownBaseSha: string;
  currentHeadSha: string;
  tokenConfigured: boolean;
  failClosedEngaged: boolean;
  lastErrorCode: string | null;
  totalPrsCreated: number;
  totalPrsMerged: number;
  totalPagesDeploys: number;
  recentPRs: VUAPullRequestRecord[];
  latestPageDeployment: VUAGitPageDeployment | null;
  auditTrail: VortexEvidence[];
  connectomeDecision: VUAConnectomeDecision;
}
