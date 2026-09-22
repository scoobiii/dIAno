import { describe, expect, it } from 'vitest';
import { graphEdge, rejectSyntheticMarker, validateExecutionProof } from '../src/governance/proof-contract';

describe('governance proof contract', () => {
  it('accepts a real-shaped execution proof', () => {
    expect(validateExecutionProof({ version:'1', executed:true, signature:'ed25519:sig', inputHash:'sha256:abc', outputHash:'sha256:def' })).toBe(true);
  });
  it('rejects an unexecuted or malformed proof', () => {
    expect(validateExecutionProof({ version:'1', executed:false, signature:'x', inputHash:'sha256:abc', outputHash:'sha256:def' })).toBe(false);
    expect(validateExecutionProof({ version:'1', executed:true, signature:'x', inputHash:'bad', outputHash:'sha256:def' })).toBe(false);
  });
  it('creates provenance-bearing graph edges', () => {
    expect(graphEdge('neuron:A','neuron:B','synapse','flywire_annotations@3.1.0').relation).toBe('synapse');
    expect(() => graphEdge('neuron:A','neuron:A','synapse','x')).toThrow();
    expect(() => graphEdge('','','','')).toThrow();
    expect(() => graphEdge('neuron:A','neuron:B','synapse','')).toThrow();
  });
  it('rejects known synthetic markers', () => {
    expect(rejectSyntheticMarker('real connector execution')).toBe(true);
    expect(rejectSyntheticMarker('fakeHardware result')).toBe(false);
  });
});