# dIAno

AI/game architecture for governed execution, graph-based cognition and verifiable connectors.

<!-- VUA-GOVERNANCE:START -->

## Governança VUA + FlyWire

- VUA: installed from `github:scoobiii/vua` in CI.
- CI: lint + 100% governance coverage + VUA mock detector + VUA conformance + VUC proof gate.
- Proof contract: `execution=true` + Ed25519 signature + input/output SHA-256 hashes.
- FlyWire source: `flyconnectome/flywire_annotations`, with release provenance tracked in architecture docs.
- Graph rule: uma sinapse é uma aresta com origem, destino e proveniência; nunca uma saída sintética.

### Evolução automática

O workflow de governança verifica e sincroniza este bloco e os documentos de arquitetura conforme o projeto evolui. Mudanças geradas passam por PR/CI.

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
```

O gate de cobertura é 100% para o módulo de governança instrumentado. O CI também roda os gates do VUA e os testes de prova/no-fallback do VUC.

**Assinatura:** GoS3
