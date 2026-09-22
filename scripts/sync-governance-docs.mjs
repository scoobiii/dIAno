#!/usr/bin/env node
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const start = '<!-- VUA-GOVERNANCE:START -->';
const end = '<!-- VUA-GOVERNANCE:END -->';
const vua = pkg.dependencies?.['@vortexfoundation/vua'] ?? 'configured in package.json';

const block = [
  start,
  '',
  '## Governança VUA + FlyWire',
  '',
  '- VUA: ' + vua + ' in CI.',
  '- CI: lint + 100% governance coverage + VUA mock detector/conformance + VUC execution-proof/no-fallback gates.',
  '- Proof contract: execution must be true, with a non-empty signature field and SHA-256 input/output hashes; the VUC gate validates the external execution-proof/no-fallback contract.',
  '- FlyWire source: `flyconnectome/flywire_annotations`, with release provenance tracked in architecture docs.',
  '- Graph rule: uma sinapse é uma aresta com origem, destino e proveniência; nunca uma saída sintética.',
  '',
  '### Evolução automática',
  '',
  'O workflow semanal de governança regenera este bloco do README e abre um PR quando houver drift. Ele não regenera automaticamente os documentos de arquitetura.',
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
