#!/usr/bin/env node
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const start = '<!-- VUA-GOVERNANCE:START -->';
const end = '<!-- VUA-GOVERNANCE:END -->';
const vua = pkg.dependencies?.['@vortexfoundation/vua'] ?? 'configured in CI';

const block = [
  start,
  '',
  '## Governança VUA + FlyWire',
  '',
  '- VUA: ' + vua + '.',
  '- CI: lint + 100% governance coverage + VUA mock detector + VUA conformance + VUC proof gate.',
  '- Proof contract: execution=true + Ed25519 signature + input/output SHA-256 hashes.',
  '- FlyWire source: flyconnectome/flywire_annotations, with release provenance tracked in architecture docs.',
  '- Graph rule: uma sinapse é uma aresta com origem, destino e proveniência; nunca uma saída sintética.',
  '',
  '### Evolução automática',
  '',
  'O workflow verifica e sincroniza este bloco e os documentos de arquitetura conforme o projeto evolui. Mudanças geradas passam por PR/CI.',
  '',
  end
].join('\n');

const path = 'README.md';
const readme = fs.readFileSync(path, 'utf8');
const a = readme.indexOf(start);
const b = readme.indexOf(end);
const next = a >= 0 && b > a
  ? readme.slice(0, a) + block + readme.slice(b + end.length)
  : readme.trimEnd() + '\n\n' + block + '\n';
fs.writeFileSync(path, next);
console.log('Governance documentation synchronized.');
