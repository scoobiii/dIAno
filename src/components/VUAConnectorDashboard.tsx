import React, { useState } from 'react';
import {
  GitPullRequest,
  GitMerge,
  Globe,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Activity,
  Zap,
  Sparkles,
  ExternalLink,
  Lock,
  Unlock,
  Download,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Brain,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { VUAConnectorAI } from '../engine/vuaConnectorAI';
import { VUAGovernanceState, VUAPullRequestRecord, VortexEvidence } from '../types/vua';

interface VUAConnectorDashboardProps {
  vuaConnector: VUAConnectorAI;
  currentGeneration: number;
  currentScore: number;
  bestScore: number;
  currentEpochName: string;
}

export const VUAConnectorDashboard: React.FC<VUAConnectorDashboardProps> = ({
  vuaConnector,
  currentGeneration,
  currentScore,
  bestScore,
  currentEpochName,
}) => {
  const [state, setState] = useState<VUAGovernanceState>(vuaConnector.state);
  const [targetRepoInput, setTargetRepoInput] = useState<string>(vuaConnector.state.targetRepo);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isTokenConfigured, setIsTokenConfigured] = useState<boolean>(vuaConnector.state.tokenConfigured);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedProof, setCopiedProof] = useState<string | null>(null);
  const [selectedPR, setSelectedPR] = useState<VUAPullRequestRecord | null>(null);

  const refreshState = () => {
    setState({ ...vuaConnector.state });
  };

  const handleUpdateRepo = () => {
    vuaConnector.setTargetRepo(targetRepoInput);
    refreshState();
    setStatusMessage(`Repositório alvo atualizado para: ${targetRepoInput}`);
  };

  const handleSaveToken = () => {
    vuaConnector.setAuthToken(tokenInput);
    setIsTokenConfigured(!!tokenInput.trim());
    refreshState();
    setStatusMessage(
      tokenInput.trim()
        ? 'GitHub Token vinculado com sucesso. Modo de autenticação remota ativo.'
        : 'Token limpo. Modo de validação fail-closed / sandbox criptográfica local ativo.'
    );
  };

  const handleCreatePR = async () => {
    setIsProcessing(true);
    setStatusMessage('Calculando sinapses VFB e gerando prova de mutação Vortex...');
    try {
      const res = await vuaConnector.createOrUpdatePullRequest(
        `feat(vfb-ai): Marco Evolutivo Gen ${currentGeneration} (${currentScore} pts - ${currentEpochName})`,
        currentGeneration,
        currentScore,
        currentEpochName
      );
      refreshState();
      if (res.success && res.pr) {
        setSelectedPR(res.pr);
        setStatusMessage(`PR #${res.pr.prNumber} criado com sucesso com prova criptográfica Vortex!`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMergePR = async (prNumber: number) => {
    setIsProcessing(true);
    setStatusMessage(`Validando Quality Gates e efetuando merge do PR #${prNumber} em main...`);
    try {
      const res = await vuaConnector.mergePullRequest(prNumber);
      refreshState();
      if (res.success) {
        setStatusMessage(`PR #${prNumber} mergeado em main! Deploy do GitHub Pages disparado.`);
      } else {
        setStatusMessage(`Falha ao mergear: ${res.error}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeployPages = async () => {
    setIsProcessing(true);
    setStatusMessage('Disparando deploy dinâmico no GitHub Pages...');
    try {
      const res = await vuaConnector.dispatchGitHubPagesDeployment();
      refreshState();
      setStatusMessage(`GitHub Pages atualizado com sucesso em ${res.deployment.pageUrl}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedProof(id);
    setTimeout(() => setCopiedProof(null), 2000);
  };

  const handleExportAudit = () => {
    const bundle = vuaConnector.exportGovernanceAuditBundle();
    const blob = new Blob([bundle.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VORTEX_VUA_AUDIT_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { connectomeDecision } = state;
  const { neuropilSignals, neurotransmitters } = connectomeDecision;

  return (
    <div
      id="vua-connector-dashboard"
      className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/90 p-3.5 shadow-2xl backdrop-blur font-mono text-xs"
    >
      {/* Top Header: VUA Connector AI Status & Governance Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
            <Cpu className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-sm text-cyan-300">
                IA CONECTORA VUA // VORTEX GOVERNANCE
              </span>
              <span className="rounded border border-purple-500/30 bg-purple-950/60 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">
                TOPOLOGIA VIRTUAL FLY BRAIN
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Alvo Oficial:</span>
              <a
                href={`https://github.com/${state.targetRepo}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
              >
                https://github.com/{state.targetRepo}
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-slate-600">•</span>
              <a
                href={`https://${state.targetRepo.split('/')[0]}.github.io/${state.targetRepo.split('/')[1] || 'vua'}/`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                GitHub Pages
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Governance Compliance Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-[11px] text-emerald-300 font-semibold shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Vortex Contract: Conforme (Fail-Closed)</span>
          </div>

          <button
            id="btn-vua-export-audit"
            type="button"
            onClick={handleExportAudit}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] text-slate-200 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Exportar Provas (.MD)</span>
          </button>
        </div>
      </div>

      {/* Row 1: VirtualFlyBrain Connectome Decision Engine for Git Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* Neuropils Routing */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-slate-800 pb-1">
            <span className="flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 text-purple-400" />
              Sinais Anatômicos VFB
            </span>
            <span className="text-purple-300 font-mono text-[10px]">Connectome Graph</span>
          </div>
          <div className="space-y-1.5 text-[10.5px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Óptico ME/LP (Sensorial Jogo):</span>
              <span className="font-bold text-sky-300">
                {(neuropilSignals.opticLobeSensory * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div
                className="bg-sky-400 h-full transition-all"
                style={{ width: `${neuropilSignals.opticLobeSensory * 100}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Corpos Fungiformes (Valoração MB):</span>
              <span className="font-bold text-emerald-300">
                {(neuropilSignals.mushroomBodyValence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all"
                style={{ width: `${neuropilSignals.mushroomBodyValence * 100}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Complexo Central (Ângulo Governança):</span>
              <span className="font-bold text-amber-300">{neuropilSignals.centralComplexAngle}°</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all"
                style={{ width: `${(neuropilSignals.centralComplexAngle / 360) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Neurochemical Dynamics */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-slate-800 pb-1">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              Neuroquímica & Recompensa
            </span>
            <span className="text-cyan-300 font-mono text-[10px]">Transmissores</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 text-[10px]">DOPAMINA (Recompensa)</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">{neurotransmitters.dopamine} nM</div>
              <div className="text-[9px] text-slate-500">Breakthrough pontuação</div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 text-[10px]">OCTOPAMINA (Risco)</div>
              <div className="text-sm font-bold text-rose-400 mt-0.5">{neurotransmitters.octopamine} nM</div>
              <div className="text-[9px] text-slate-500">Penalidade regressão</div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 text-[10px]">GABA (Filtro Freio)</div>
              <div className="text-sm font-bold text-indigo-400 mt-0.5">{neurotransmitters.gaba} nM</div>
              <div className="text-[9px] text-slate-500">Inibição de PR precoce</div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 text-[10px]">ACETILCOLINA (Fluxo)</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">{neurotransmitters.acetylcholine} nM</div>
              <div className="text-[9px] text-slate-500">Transmissão motora</div>
            </div>
          </div>
        </div>

        {/* Giant Fiber Motor Trigger & Decision State */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                Decisão VUA Atual
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  neuropilSignals.giantFiberSpike
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {neuropilSignals.giantFiberSpike ? '⚡ GIANT FIBER: ATIVO' : 'GIANT FIBER: REPOUSO'}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-slate-400 text-[10.5px]">Ação Recomendada pela IA:</div>
              <div className="text-base font-bold text-cyan-300 font-mono">
                {connectomeDecision.decision === 'AUTO_MERGE' && '🚀 AUTO-MERGE EM MAIN'}
                {connectomeDecision.decision === 'PROPOSE_PR' && '📝 ABRIR PULL REQUEST'}
                {connectomeDecision.decision === 'DISPATCH_PAGES' && '🌐 PUBLICAR GITHUB PAGES'}
                {connectomeDecision.decision === 'HOLD' && '🛡️ AGUARDANDO MARCO'}
                {connectomeDecision.decision === 'FAIL_CLOSED' && '⛔ FAIL-CLOSED BLOQUEADO'}
              </div>
              <div className="text-[10px] text-slate-500">
                Confiança Neural: {(connectomeDecision.confidence * 100).toFixed(0)}% • Base SHA:{' '}
                <code className="text-slate-300">{state.lastKnownBaseSha.slice(0, 7)}</code>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              id="btn-vua-trigger-pr"
              type="button"
              disabled={isProcessing}
              onClick={handleCreatePR}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-98 text-slate-950 font-bold px-2.5 py-1.5 text-xs shadow-md transition-all disabled:opacity-50"
            >
              <GitPullRequest className="h-3.5 w-3.5" />
              <span>Gerar PR com Prova</span>
            </button>

            <button
              id="btn-vua-trigger-pages"
              type="button"
              disabled={isProcessing}
              onClick={handleDeployPages}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-slate-950 font-bold px-2.5 py-1.5 text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Deploy Pages</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Alert Bar */}
      {statusMessage && (
        <div className="flex items-center justify-between rounded-lg bg-cyan-950/50 border border-cyan-500/30 p-2 text-cyan-200 text-[11px]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Row 2: Target Repository & Auth Binding (Fail-Closed Enforcement) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="text-slate-400 text-[11px] shrink-0">Repo GitHub:</span>
          <input
            id="input-vua-target-repo"
            type="text"
            value={targetRepoInput}
            onChange={(e) => setTargetRepoInput(e.target.value)}
            placeholder="scoobiii/vua"
            className="flex-1 rounded bg-slate-950 border border-slate-700 px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          />
          <button
            id="btn-vua-save-repo"
            type="button"
            onClick={handleUpdateRepo}
            className="rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-slate-200 text-[11px] font-semibold transition-colors"
          >
            Definir Alvo
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="text-slate-400 text-[11px] shrink-0">Personal Token (PAT):</span>
          <input
            id="input-vua-auth-token"
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder={isTokenConfigured ? '••••••••••••••••' : 'Opcional (Usa Prova Local por padrão)'}
            className="flex-1 rounded bg-slate-950 border border-slate-700 px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          />
          <button
            id="btn-vua-save-token"
            type="button"
            onClick={handleSaveToken}
            className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-slate-200 text-[11px] font-semibold transition-colors"
          >
            {isTokenConfigured ? <Lock className="h-3 w-3 text-emerald-400" /> : <Unlock className="h-3 w-3 text-slate-400" />}
            <span>{isTokenConfigured ? 'Atualizar Token' : 'Vincular Token'}</span>
          </button>
        </div>
      </div>

      {/* Row 3: Pull Requests with Vortex Cryptographic Evidence Records */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-slate-200">
              Pull Requests Gerados pela IA Conectora VUA ({state.recentPRs.length})
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Total Criados: <strong className="text-slate-200">{state.totalPrsCreated}</strong> • Merged:{' '}
            <strong className="text-emerald-400">{state.totalPrsMerged}</strong>
          </div>
        </div>

        {state.recentPRs.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-[11px] flex flex-col items-center gap-1.5">
            <Activity className="h-5 w-5 text-slate-600" />
            <span>Nenhum PR aberto ainda. O motor VUA criará automaticamente em marcos evolutivos</span>
            <button
              type="button"
              onClick={handleCreatePR}
              className="mt-1 text-cyan-400 hover:underline font-bold"
            >
              Criar Primeiro Pull Request de Marco Agora
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {state.recentPRs.map((pr) => (
              <div
                key={pr.id}
                className="flex flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        pr.state === 'merged'
                          ? 'bg-purple-950/70 text-purple-300 border border-purple-500/40'
                          : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {pr.state === 'merged' ? 'MERGED' : 'OPEN'}
                    </span>
                    <span className="font-bold text-slate-100">PR #{pr.prNumber}</span>
                    <span className="text-slate-300 truncate max-w-[280px] sm:max-w-md">{pr.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{pr.epochName}</span>
                    <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] text-cyan-300 font-bold">
                      {pr.scoreAchieved} pts
                    </span>

                    {pr.state === 'open' && (
                      <button
                        type="button"
                        onClick={() => handleMergePR(pr.prNumber)}
                        disabled={isProcessing}
                        className="flex items-center gap-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold px-2 py-0.5 text-[10px] transition-colors"
                      >
                        <GitMerge className="h-3 w-3" />
                        <span>Auto-Merge</span>
                      </button>
                    )}

                    <a
                      href={pr.prUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-white p-1"
                      title="Ver PR no GitHub"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* Evidence Hash Ribbon */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                  <div className="flex items-center gap-2">
                    <span>Base SHA: <code className="text-slate-400">{pr.evidence.baseSha.slice(0, 8)}</code></span>
                    <span>•</span>
                    <span>Head SHA: <code className="text-slate-400">{pr.evidence.headSha.slice(0, 8)}</code></span>
                    <span>•</span>
                    <span>Payload Hash: <code className="text-slate-400">{pr.evidence.payloadHash.slice(0, 8)}</code></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500/90 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Prova: {pr.evidence.executionProof.slice(0, 14)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(pr.evidence.executionProof, pr.id)}
                      className="text-slate-400 hover:text-white"
                      title="Copiar Prova de Execução"
                    >
                      {copiedProof === pr.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 4: GitHub Pages Live Deployment Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2.5">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">GitHub Pages Status:</span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE ATIVO
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              URL Dinâmica Oficial:{' '}
              <a
                href={state.latestPageDeployment?.pageUrl || `https://${state.targetRepo.split('/')[0]}.github.io/${state.targetRepo.split('/')[1] || 'vua'}/`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline font-bold"
              >
                {state.latestPageDeployment?.pageUrl || `https://${state.targetRepo.split('/')[0]}.github.io/${state.targetRepo.split('/')[1] || 'vua'}/`}
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[10.5px] text-slate-400">
            Último Commit Deployed:{' '}
            <code className="text-cyan-300 font-bold">
              {state.latestPageDeployment?.commitSha || state.lastKnownBaseSha.slice(0, 7)}
            </code>
          </div>
          <button
            type="button"
            onClick={handleDeployPages}
            disabled={isProcessing}
            className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 text-[11px] text-slate-200 font-bold transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Sincronizar Pages</span>
          </button>
        </div>
      </div>
    </div>
  );
};
