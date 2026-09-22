# Governança dIAno: VUA + FlyWire + VUC

**Status:** proposta implementável em CI  
**Responsável:** GoS3  
**Escopo:** qualidade de código, execução verificável e arquitetura de conectoma.

## 1. Modelo

O dIAno usa três camadas:

1. **VUA** — governa conectores e exige evidência de execução.
2. **FlyWire** — fornece a referência de conectoma/annotations usada para modelar relações como grafo.
3. **VUC** — fornece o gate de execução comprovada quando uma prova externa precisa ser executada antes de aceitar um resultado.

O repositório `flyconnectome/flywire_annotations` documenta a release pública FAFB 783 e mantém versões por tags; a release documentada atualmente é `3.1.0`. As tabelas de conectividade são mantidas separadamente; portanto, annotations não devem ser tratadas como a tabela completa de sinapses.

## 2. Sinapse como game loop

Cada operação segue:

`STATE → ACTION → RULE → EXECUTION → PROOF → REWARD/COMMIT`

- **STATE:** estado observável do jogo/agente/grafo.
- **ACTION:** ação solicitada pelo agente.
- **RULE:** capability/policy VUA.
- **EXECUTION:** conector real, não resposta sintetizada.
- **PROOF:** ExecutionProof assinado.
- **REWARD/COMMIT:** somente depois da prova; falha fecha o fluxo.

Regra: **sem execução comprovada, não há recompensa, promoção ou mutação de estado.**

## 3. Mock detector

O CI executa o detector de mocks do VUA e a suíte de conformidade. O teste positivo de controle pertence ao VUA; o gate do dIAno exige que o repositório permaneça sem saída sintética não-governada.

## 4. Cobertura

`npm run test:coverage` aplica limiar de **100%** ao módulo de governança do dIAno. O escopo é explícito para não apresentar 100% do projeto quando apenas um subconjunto foi instrumentado.

Para elevar o escopo, adicione módulos ao `include` do Vitest e testes correspondentes; o CI falha até atingir 100%.

## 5. Evolução automática

O workflow roda em PR, push em `main` e semanalmente. O bloco de governança do README é regenerado por `scripts/sync-governance-docs.mjs`. A sincronização não faz merge automático: mudanças materiais continuam passando por PR/CI.

## 6. Fontes

- FlyWire annotations: https://github.com/flyconnectome/flywire_annotations
- dIAno: https://github.com/scoobiii/dIAno
- VUA: https://github.com/scoobiii/vua
- VUC: https://github.com/scoobiii/vuc

**Assinatura:** GoS3