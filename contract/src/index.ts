/**
 * Entry point for the compiled GymProof contract.
 *
 * `./managed/gymproof` is produced by the Compact compiler:
 *   compact compile src/gymproof.compact ./src/managed/gymproof
 * It is intentionally not committed — run `npm run compact` before building
 * the DApp against a real network.
 */
import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";

export * from "./managed/gymproof/contract/index.js";
export * from "./witnesses";

import * as CompiledGymProof from "./managed/gymproof/contract/index.js";
import * as Witnesses from "./witnesses";

export const CompiledGymProofContract = CompiledContract.make<
  CompiledGymProof.Contract<Witnesses.GymProofPrivateState>
>("GymProof", CompiledGymProof.Contract<Witnesses.GymProofPrivateState>).pipe(
  CompiledContract.withWitnesses(Witnesses.witnesses),
  CompiledContract.withCompiledFileAssets("./managed/gymproof"),
);
