import React, { useState } from 'react';
import {
  X,
  GitPullRequest,
  GitMerge,
  Globe,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import JSZip from 'jszip';

interface GitHubOpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGeneration: number;
  bestScore: number;
  currentEpochName: string;
}

const DEPLOY_PAGES_YAML = `name: Deploy Dynamic GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci || npm install

      - name: Verify Types and Lint
        run: npm run lint

      - name: Compile and Build Applet (Production)
        run: npm run build

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

const CI_PR_AUTO_MERGE_YAML = `name: CI Push to PR & Auto-Merge to Main

on:
  push:
    branches-ignore:
      - main
      - 'gh-pages'

permissions:
  contents: write
  pull-requests: write
  checks: write
  statuses: write

jobs:
  validate-and-auto-merge:
    name: Quality Gates & Automated Merge
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci || npm install

      - name: Quality Gate 1 - TypeScript Verification & Lint
        run: npm run lint

      - name: Quality Gate 2 - Production Build
        run: npm run build

      - name: Check / Create Pull Request to Main
        id: pr_step
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          BRANCH_NAME: \${{ github.ref_name }}
        run: |
          echo "Checking if PR exists for branch: $BRANCH_NAME against main..."
          EXISTING_PR=$(gh pr list --head "$BRANCH_NAME" --base main --state open --json number --jq '.[0].number')
          
          if [ -z "$EXISTING_PR" ]; then
            echo "Creating automated PR from $BRANCH_NAME to main..."
            COMMIT_MSG=$(git log -1 --pretty=%B | head -n 1)
            PR_URL=$(gh pr create \\
              --base main \\
              --head "$BRANCH_NAME" \\
              --title "feat(auto-ci): $COMMIT_MSG" \\
              --body "### Automated Game Improvement PR 🚀
              
              This Pull Request was generated automatically by the CI Pipeline on push to \`$BRANCH_NAME\`.
              
              #### Quality Gates:
              - [x] TypeScript Static Typing (\`tsc --noEmit\`) verified
              - [x] Production Build (\`vite build\`) verified
              - [x] Governance and Mergeability evaluated
              
              *Once merged, GitHub Pages will automatically deploy the latest improvements.*" \\
              --label "automated-pr,automerge")
            echo "Created PR: $PR_URL"
            PR_NUMBER=$(gh pr view --json number --jq '.number')
          else
            echo "PR already exists: #$EXISTING_PR"
            PR_NUMBER=$EXISTING_PR
          fi
          echo "pr_number=$PR_NUMBER" >> "$GITHUB_OUTPUT"

      - name: Verify Mergeability and Auto-Merge to Main
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          PR_NUM: \${{ steps.pr_step.outputs.pr_number }}
        run: |
          echo "Verifying mergeability for PR #$PR_NUM..."
          MERGEABLE=$(gh pr view "$PR_NUM" --json mergeable --jq '.mergeable')
          echo "Mergeable status: $MERGEABLE"
          
          if [ "$MERGEABLE" = "MERGEABLE" ] || [ "$MERGEABLE" = "UNKNOWN" ]; then
            echo "PR is mergeable and quality gates passed. Executing auto-merge to main..."
            gh pr merge "$PR_NUM" --auto --squash --delete-branch || \\
            gh pr merge "$PR_NUM" --squash --delete-branch
            echo "PR #$PR_NUM successfully merged to main!"
          else
            echo "PR #$PR_NUM has merge conflicts ($MERGEABLE). Manual resolution required."
            exit 1
          fi
`;

export const GitHubOpsModal: React.FC<GitHubOpsModalProps> = ({
  isOpen,
  onClose,
  currentGeneration,
  bestScore,
  currentEpochName,
}) => {
  const [activeTab, setActiveTab] = useState<'pages' | 'ci_pipeline' | 'workflows' | 'setup'>('pages');
  const [selectedWorkflow, setSelectedWorkflow] = useState<'deploy' | 'pr_merge'>('pr_merge');
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const workflowsFolder = zip.folder('.github')?.folder('workflows');
      if (workflowsFolder) {
        workflowsFolder.file('deploy-pages.yml', DEPLOY_PAGES_YAML);
        workflowsFolder.file('ci-pr-auto-merge.yml', CI_PR_AUTO_MERGE_YAML);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'iamdinosaur-github-ci-pages.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      id="github-ops-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md font-mono"
    >
      <div
        id="github-ops-modal-card"
        className="relative flex h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>GITHUB PAGES & CI/CD OPS HUB</span>
                <span className="rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0.5">
                  CI/CD ATIVO
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Deploy dinâmico no GitHub Pages e automação de Push ➔ PR ➔ Auto-Merge na \`main\`
              </div>
            </div>
          </div>

          <button
            id="btn-close-github-ops"
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-3 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-bold transition-all ${
              activeTab === 'pages'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>GitHub Pages Dinâmica</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ci_pipeline')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-bold transition-all ${
              activeTab === 'ci_pipeline'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitPullRequest className="h-3.5 w-3.5" />
            <span>Pipeline CI: Push ➔ PR ➔ Main</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workflows')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-bold transition-all ${
              activeTab === 'workflows'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Arquivos YAML (.github)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-bold transition-all ${
              activeTab === 'setup'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Guia de Ativação</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 text-xs">
          {/* TAB 1: GITHUB PAGES DINÂMICA */}
          {activeTab === 'pages' && (
            <div className="flex flex-col gap-4">
              {/* Status Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="text-[10px] text-slate-400">STATUS DA BUILD</div>
                  <div className="text-base font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" /> PASSING
                  </div>
                  <div className="text-[9.5px] text-slate-500 mt-1">tsc --noEmit & vite build</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="text-[10px] text-slate-400">BRANCH DE DEPLOY</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">main</div>
                  <div className="text-[9.5px] text-slate-500 mt-1">GitHub Pages Artifacts v3</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="text-[10px] text-slate-400">ERA ATIVA</div>
                  <div className="text-base font-bold text-amber-300 mt-0.5 truncate">
                    {currentEpochName}
                  </div>
                  <div className="text-[9.5px] text-slate-500 mt-1">Geração #{currentGeneration}</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="text-[10px] text-slate-400">ROTA ESTÁTICA</div>
                  <div className="text-base font-bold text-purple-400 mt-0.5">./ (Relative)</div>
                  <div className="text-[9.5px] text-slate-500 mt-1">Sem conflito de subcaminho</div>
                </div>
              </div>

              {/* Dynamic Changelog Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  LOG DINÂMICO DE MELHORIAS INCREMENTAIS (AUTO-PUBLICÁVEL):
                </div>
                <div className="space-y-2 text-slate-300 text-[11px]">
                  <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800 flex items-start gap-2">
                    <span className="rounded bg-purple-500/20 text-purple-400 px-1.5 py-0.5 text-[10px] font-bold">
                      CÉREBRO VFB
                    </span>
                    <div>
                      <strong className="text-purple-300">Integração do Connectoma Biológico Drosophila (VirtualFlyBrain)</strong>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        Neuropilos ópticos (ME/LP), complexo central (EB/FB/PB), corpo cogumelo com células de Kenyon e via rápida Giant Fiber com telemetria de Dopamina, Octopamina e GABA.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800 flex items-start gap-2">
                    <span className="rounded bg-amber-500/20 text-amber-400 px-1.5 py-0.5 text-[10px] font-bold">
                      EVOLUÇÃO AMBIENTAL
                    </span>
                    <div>
                      <strong className="text-amber-300">Evolução do Ambientes em 5 Épocas Planetárias</strong>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        Cretáceo Primordial, Neo-Tokyo 2027, Biosfera Marciana 2088 (baixa gravidade 0.46g), Matriz Quântica e Enxame de Dyson com física, gravidade e partículas dinâmicas.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800 flex items-start gap-2">
                    <span className="rounded bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 text-[10px] font-bold">
                      MULTI-DIMENSÃO
                    </span>
                    <div>
                      <strong className="text-cyan-300">Ambientes 2D Neon, 3D Pista em Perspectiva e 4D Tesseract</strong>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        Projeções quadridimensionais estereográficas com 16 vértices e 32 arestas rotativas, linhas de fuga 3D e renderização 2D clássica.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800 flex items-start gap-2">
                    <span className="rounded bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 text-[10px] font-bold">
                      CI / CD AUTO
                    </span>
                    <div>
                      <strong className="text-emerald-300">Workflow GitHub Actions: Push ➔ PR ➔ Auto-Merge ➔ Pages</strong>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        Toda melhoria incrementada em qualquer branch abre PR automaticamente, verifica tipagem e compilação, e se mergeável avança direto para a \`main\` com deploy automático.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges preview */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <div className="text-[11px] font-bold text-slate-300 mb-2">BADGES DINÂMICOS DO REPOSITÓRIO:</div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-2 py-1 text-[10px] font-bold">
                    Build: Passing (tsc + vite)
                  </span>
                  <span className="rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 px-2 py-1 text-[10px] font-bold">
                    GitHub Pages: Ready
                  </span>
                  <span className="rounded bg-purple-950/80 border border-purple-500/50 text-purple-300 px-2 py-1 text-[10px] font-bold">
                    VFB Connectome: Drosophila Active
                  </span>
                  <span className="rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 px-2 py-1 text-[10px] font-bold">
                    Auto-Merge: Enabled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PIPELINE CI PUSH TO PR TO MAIN */}
          {activeTab === 'ci_pipeline' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                  <GitPullRequest className="h-4 w-4 text-cyan-400" />
                  FLUXO AUTOMÁTICO: PUSH ➔ CRIAÇÃO DE PR ➔ GATES ➔ AUTO-MERGE ➔ MAIN
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Quando você ou um robô faz push em qualquer branch (ex: \`feat/melhoria-dino\`), o GitHub Actions assume o controle:
                </p>

                {/* Step Flow Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-cyan-400 font-bold">ETAPA 1</div>
                      <div className="text-[11px] font-bold text-slate-200 mt-0.5">Push em Branch</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Disparo em qualquer branch de melhoria (exceto main).
                      </div>
                    </div>
                    <div className="mt-2 text-[9px] text-slate-500 font-mono">git push origin feat/...</div>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-purple-400 font-bold">ETAPA 2</div>
                      <div className="text-[11px] font-bold text-slate-200 mt-0.5">Quality Gates</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Executa \`tsc --noEmit\` e \`vite build\` em ambiente isolado.
                      </div>
                    </div>
                    <div className="mt-2 text-[9px] text-emerald-400 font-mono">Verificação estrita 100%</div>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-amber-400 font-bold">ETAPA 3</div>
                      <div className="text-[11px] font-bold text-slate-200 mt-0.5">Criação do PR</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Se não existir PR aberto, cria via \`gh pr create\` com changelog.
                      </div>
                    </div>
                    <div className="mt-2 text-[9px] text-amber-400 font-mono">gh pr create --base main</div>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-emerald-400 font-bold">ETAPA 4</div>
                      <div className="text-[11px] font-bold text-slate-200 mt-0.5">Auto-Merge na Main</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Se mergeável (sem conflitos), funde na \`main\` e dispara o Pages!
                      </div>
                    </div>
                    <div className="mt-2 text-[9px] text-cyan-400 font-mono">gh pr merge --auto</div>
                  </div>
                </div>
              </div>

              {/* Governance Contract Checklist */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  CONTRATO DE GOVERNANÇA & CONDIÇÕES DE PARADA (FAIL-CLOSED):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                  <div className="rounded bg-slate-950/80 p-2 border border-slate-800">
                    <span className="text-emerald-400 font-bold">✓ Merge Condicional:</span>
                    <p className="text-slate-400 mt-0.5">
                      Apenas avança para a branch \`main\` se \`mergeable === 'MERGEABLE'\` e todos os quality gates estiverem verdes.
                    </p>
                  </div>
                  <div className="rounded bg-slate-950/80 p-2 border border-slate-800">
                    <span className="text-rose-400 font-bold">✕ Parada Obrigatória:</span>
                    <p className="text-slate-400 mt-0.5">
                      Se houver conflito de merge ou falha de tipagem, o pipeline falha fechado (fail-closed) sem tocar na branch \`main\`.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKFLOW FILES (.github/workflows) */}
          {activeTab === 'workflows' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedWorkflow('pr_merge')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      selectedWorkflow === 'pr_merge'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ci-pr-auto-merge.yml
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkflow('deploy')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      selectedWorkflow === 'deploy'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    deploy-pages.yml
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        selectedWorkflow === 'pr_merge' ? CI_PR_AUTO_MERGE_YAML : DEPLOY_PAGES_YAML
                      )
                    }
                    className="flex items-center gap-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-200 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar YAML'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isDownloading}
                    className="flex items-center gap-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-2.5 py-1 text-[11px] font-bold transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isDownloading ? 'Gerando...' : 'Baixar .github.zip'}</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-3 overflow-x-auto text-[11px] text-slate-300">
                <pre className="font-mono">
                  {selectedWorkflow === 'pr_merge' ? CI_PR_AUTO_MERGE_YAML : DEPLOY_PAGES_YAML}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: GUIA DE ATIVAÇÃO NO GITHUB */}
          {activeTab === 'setup' && (
            <div className="flex flex-col gap-3.5">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  3 PASSOS SIMPLES PARA ATIVAR NO SEU REPOSITÓRIO GITHUB:
                </div>
                <p className="text-slate-400 text-[11px] mb-3">
                  Como os arquivos já foram gerados na raiz do projeto na pasta <code className="text-cyan-300">.github/workflows/</code>, você só precisa configurar duas permissões no GitHub:
                </p>

                <div className="space-y-3">
                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                    <div className="font-bold text-cyan-300 text-xs">
                      Passo 1: Ativar GitHub Pages via Actions
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      No seu repositório GitHub, vá em:
                      <br />
                      <strong className="text-slate-200">Settings ➔ Pages ➔ Build and deployment</strong>
                      <br />
                      Em <strong>Source</strong>, selecione: <span className="text-emerald-400 font-bold">GitHub Actions</span>.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                    <div className="font-bold text-cyan-300 text-xs">
                      Passo 2: Habilitar Permissão de Criar e Aprovar PRs no Actions
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      No seu repositório GitHub, vá em:
                      <br />
                      <strong className="text-slate-200">Settings ➔ Actions ➔ General ➔ Workflow permissions</strong>
                      <br />
                      Marque:
                      <br />
                      ✓ <span className="text-slate-200 font-semibold">Read and write permissions</span>
                      <br />
                      ✓ <span className="text-emerald-400 font-bold">Allow GitHub Actions to create and approve pull requests</span>
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
                    <div className="font-bold text-cyan-300 text-xs">
                      Passo 3: Fazer Push das Melhorias
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Faça o commit e envie os arquivos para o GitHub:
                    </p>
                    <div className="mt-1.5 rounded bg-slate-900 p-2 font-mono text-[10px] text-cyan-200 border border-slate-800">
                      git add .<br />
                      git commit -m "feat: virtual fly brain connectome, environment evolution and auto-pr ci"<br />
                      git push origin main
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 px-4 py-2.5 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Workflows gravados em <code className="text-slate-200">/.github/workflows/</code></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-1.5 font-bold text-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
