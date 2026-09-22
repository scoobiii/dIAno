# Governança dIAno: VUA + FlyWire + VUC

**Status:** implementada e governada por CI  
**Responsável:** GoS3  
**Escopo:** qualidade de código, execução verificável e arquitetura de conectoma.

## 1. Modelo

O dIAno usa três camadas:

1. **VUA** — governa conectores e exige evidência de execução.
2. **FlyWire** — fornece a referência de conectoma/annotations usada para modelar relações como grafo.
3. **VUC** — fornece os gates de execução comprovada/no-fallback quando uma prova externa precisa ser executada antes de aceitar um resultado.

O repositório `flyconnectome/flywire_annotations` documenta a release pública FAFB 783 e mantém versões por tags; a release documentada atualmente é `3.1.0`. As tabelas de conectividade são mantidas separadamente; portanto, annotations não devem ser tratadas como a tabela completa de sinapses.

## 2. Sinapse como game loop

Cada operação segue:

`STATE → ACTION → RULE → EXECUTION → PROOF → REWARD/COMMIT`

- **STATE:** estado observável do jogo/agente/grafo.
- **ACTION:** ação solicitada pelo agente.
- **RULE:** capability/policy VUA.
- **EXECUTION:** conector real, não resposta sintetizada.
- **PROOF:** ExecutionProof de execução verificável.
- **REWARD/COMMIT:** somente depois da prova; falha fecha o fluxo.

Regra: **sem execução comprovada, não há recompensa, promoção ou mutação de estado.**

## 3. Mock detector

O CI executa o gate `npm run test:vua`, que instala o VUA declarado em `package.json` e executa o gate de governança do repositório. O CI também executa os gates externos do VUC para execução comprovada e no-fallback.

## 4. Cobertura

`npm run test:coverage` aplica limiar de **100%** aos arquivos em `src/governance/**/*.ts`, com 100% exigido para statements, branches, functions e lines.

O escopo é explícito: isso não representa 100% de cobertura de todo o projeto.

## 5. Evolução automática

O workflow `dIAno — VUA governance, FlyWire provenance and VUC proof` roda em PR, push em `main` e semanalmente. O script `scripts/sync-governance-docs.mjs` regenera somente o bloco de governança do README. No agendamento/manual, o workflow pode abrir um PR quando houver drift.

A sincronização não faz merge automático: mudanças materiais continuam passando por PR/CI e pela política administrativa de `main`.

## 6. Política administrativa de main

A política esperada é versionada em `ops/github/main-ruleset.json`. O script `ops/github/apply-main-ruleset.sh` aplica e verifica as regras administrativas usando `gh`.

O workflow `Main Rules Integrity` valida a policy-as-code versionada. Ele não substitui a verificação administrativa efetiva feita pelo script com credenciais apropriadas.

## 7. Fontes

- FlyWire annotations: https://github.com/flyconnectome/flywire_annotations
- dIAno: https://github.com/scoobiii/dIAno
- VUA: https://github.com/scoobiii/vua
- VUC: https://github.com/scoobiii/vuc

**Assinatura:** GoS3