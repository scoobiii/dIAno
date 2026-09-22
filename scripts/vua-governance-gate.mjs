#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
function run(label, args) {
  console.log(`\n=== VUA GATE: ${label} ===`);
  const r = spawnSync('npx', ['--yes', ...args], { stdio: 'inherit', env: { ...process.env, CI: 'true' } });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
run('mock detector / zero synthetic output', ['@vortexfoundation/vua', 'mock', 'audit']);
run('VUA conformance / execution proof', ['@vortexfoundation/vua', 'conformance']);
console.log('\nVUA GATE: PASS');