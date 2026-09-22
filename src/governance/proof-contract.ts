export type ExecutionProofContract = {
  version: '1';
  executed: boolean;
  signature: string;
  inputHash: string;
  outputHash: string;
};

export function validateExecutionProof(proof: ExecutionProofContract): boolean {
  return proof.version === '1' && proof.executed === true && proof.signature.length > 0 &&
    /^sha256:[a-f0-9]+$/.test(proof.inputHash) && /^sha256:[a-f0-9]+$/.test(proof.outputHash);
}

export function graphEdge(source: string, target: string, relation: string, provenance: string) {
  if (!source || !target || source === target) throw new Error('invalid graph edge');
  if (!relation || !provenance) throw new Error('graph edge requires provenance');
  return { source, target, relation, provenance };
}

export function rejectSyntheticMarker(payload: string): boolean {
  return !['mockResult', 'fakeHardware', 'syntheticHardware', 'TODO_MOCK', 'MOCK_OUTPUT'].some((m) => payload.includes(m));
}