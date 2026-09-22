# dIAno

AI/game architecture for governed execution, graph-based cognition and verifiable connectors.

<!-- VUA-GOVERNANCE:START -->

## Governança VUA + FlyWire

- VUA: installed from `github:scoobiii/vua` in CI.
- CI: lint + 100% governance coverage + VUA mock detector/conformance + VUC execution-proof/no-fallback gates.
- Proof contract: execution must be true, with a non-empty signature field and SHA-256 input/output hashes; the VUC gate validates the external execution-proof/no-fallback contract.
- FlyWire source: `flyconnectome/flywire_annotations`, with release provenance tracked in architecture docs.
- Graph rule: uma sinapse é uma aresta com origem, destino e proveniência; nunca uma saída sintética.

### Evolução automática

O workflow semanal de governança regenera este bloco do README e abre um PR quando houver drift. Ele não regenera automaticamente os documentos de arquitetura.

<!-- VUA-GOVERNANCE:END -->

## Arquitetura

`STATE → ACTION → RULE → EXECUTION → PROOF → REWARD/COMMIT`

O design usa princípios de game design para tornar o loop observável: estado, ação, regra, feedback e progressão. A diferença é que a recompensa/commit só existe depois da prova de execução.

## Conectoma

A referência biológica é o FlyWire FAFB 783. O repositório de annotations é versionado e inclui metadados de neurônios; dados de conectividade/sinapses são distribuídos separadamente. Não confundimos annotation com execução ou com a tabela completa de sinapses.

Veja [docs/GOVERNANCA-VUA-FLYWIRE.md](docs/GOVERNANCA-VUA-FLYWIRE.md).

## Qualidade

```bash
npm install
npm run lint
npm run test:coverage
npm run test:vua
npm run sync:docs
```

O gate de cobertura é **100%** para todos os arquivos em `src/governance/**/*.ts`, cobrindo statements, branches, functions e lines. O CI também roda os gates do VUA e os testes de execução comprovada/no-fallback do VUC.

A proteção administrativa de `main` é versionada em `ops/github/main-ruleset.json` e aplicada/verificada pelo script `ops/github/apply-main-ruleset.sh` usando `gh`. O workflow `Main Rules Integrity` valida a policy versionada; ele não afirma sozinho o estado administrativo efetivo do GitHub.

**Assinatura:** GoS3
