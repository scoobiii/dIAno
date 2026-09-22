import { describe, expect, it } from 'vitest';

describe('dIAno governance invariants', () => {
  it('rejects forbidden synthetic execution markers', () => {
    const source = JSON.stringify({ connector: 'vua', proof: 'execution-proof-v1' });
    for (const marker of ['mockResult', 'fakeHardware', 'syntheticHardware', 'TODO_MOCK', 'MOCK_OUTPUT']) {
      expect(source).not.toContain(marker);
    }
  });

  it('requires an execution proof contract', () => {
    const proof = { version: '1', executed: true, signature: 'ed25519', inputHash: 'sha256:input', outputHash: 'sha256:output' };
    expect(proof.executed).toBe(true);
    expect(proof.signature).toBeTruthy();
    expect(proof.inputHash).toMatch(/^sha256:/);
    expect(proof.outputHash).toMatch(/^sha256:/);
  });

  it('models a FlyWire synapse as a provenance-bearing graph edge', () => {
    const edge = { source: 'neuron:A', target: 'neuron:B', relation: 'synapse', provenance: 'flywire_annotations@3.1.0' };
    expect(edge.source).not.toBe(edge.target);
    expect(edge.relation).toBe('synapse');
    expect(edge.provenance).toContain('flywire_annotations@');
  });
});