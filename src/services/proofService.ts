/**
 * Zero-knowledge achievement proving.
 *
 * This is the heart of GymProof. The pipeline mirrors the reference bboard
 * flow: build providers from the connected wallet, join the deployed contract,
 * then call an impure circuit. The Compact circuit asserts the requirement over
 * *private witnesses*; the resulting transaction is proved by the proof server,
 * balanced and signed by the wallet, and submitted to Midnight.
 *
 * There is deliberately no code path that reports success without a confirmed
 * transaction. If the contract has not been compiled or deployed, or the proof
 * server is unreachable, the call fails with an explicit error.
 */
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";

import { midnightConfig } from "@/config/midnight";
import type { Challenge, ProofStage, VerifiedAchievement } from "@/types/gymproof";
import {
  ContractUnavailableError,
  buildProviders,
  loadCompiledContract,
  requireDeployedAddress,
} from "./midnightService";
import { toContractChallengeId } from "./challengeService";

export type ProofWitnessInput = {
  secretKeyHex: string;
  workoutsInWindow: number;
  longestStreak: number;
  bestLiftKg: number;
  windowStart: number;
  windowEnd: number;
};

export type ProofProgress = (stage: ProofStage, detail?: string) => void;

export class RequirementNotMetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequirementNotMetError";
  }
}

/**
 * Local pre-check. This is *not* the verification — it only avoids burning a
 * proof on data that provably cannot satisfy the circuit's assertions. The
 * authoritative check happens inside the Compact circuit.
 */
export const evaluateRequirement = (
  challenge: Challenge,
  witness: Pick<ProofWitnessInput, "workoutsInWindow" | "longestStreak" | "bestLiftKg">,
): { satisfied: boolean; reason?: string } => {
  if (witness.workoutsInWindow < challenge.requiredWorkouts) {
    return {
      satisfied: false,
      reason: `${challenge.requiredWorkouts - witness.workoutsInWindow} more workouts needed in the challenge window.`,
    };
  }
  if (witness.longestStreak < challenge.requiredStreak) {
    return {
      satisfied: false,
      reason: `A ${challenge.requiredStreak}-day streak is required; your longest is ${witness.longestStreak}.`,
    };
  }
  if (witness.bestLiftKg < challenge.requiredStrengthKg) {
    return {
      satisfied: false,
      reason: `A ${challenge.requiredStrengthKg} kg lift is required; your best recorded lift is ${witness.bestLiftKg} kg.`,
    };
  }
  return { satisfied: true };
};

const circuitFor = (challenge: Challenge): string => {
  switch (challenge.kind) {
    case "STREAK":
      return "proveWorkoutStreak";
    case "STRENGTH":
      return "proveChallengeCompletion";
    default:
      return "proveChallengeCompletion";
  }
};

/**
 * Runs the full proof + verification pipeline against Midnight.
 *
 * @throws ContractUnavailableError when Compact artifacts or the deployment
 *         address are missing — the app surfaces this verbatim rather than
 *         simulating a verification.
 */
export const proveAchievement = async (
  challenge: Challenge,
  witness: ProofWitnessInput,
  connectedAPI: ConnectedAPI,
  onProgress: ProofProgress,
): Promise<VerifiedAchievement> => {
  onProgress("preparing", "Preparing private data…");

  const local = evaluateRequirement(challenge, witness);
  if (!local.satisfied) {
    onProgress("failed", local.reason);
    throw new RequirementNotMetError(local.reason ?? "Requirement not satisfied.");
  }

  const contractAddress = requireDeployedAddress();
  const contractModule = await loadCompiledContract();

  const { CompiledGymProofContract, createGymProofPrivateState } = contractModule as {
    CompiledGymProofContract: unknown;
    createGymProofPrivateState: (
      secretKey: Uint8Array,
      workouts: unknown[],
      windows: Record<string, { start: number; end: number }>,
    ) => unknown;
  };
  if (!CompiledGymProofContract) {
    throw new ContractUnavailableError(
      "The compiled GymProof contract module did not export `CompiledGymProofContract`. Re-run `npm run compact`.",
      "NOT_COMPILED",
    );
  }

  const [{ findDeployedContract }, { inMemoryPrivateStateProvider }] = await Promise.all([
    import("@midnight-ntwrk/midnight-js-contracts"),
    import("@/services/inMemoryPrivateStateProvider"),
  ]);

  const challengeIdHex = toContractChallengeId(challenge.id);
  const privateStateProvider = inMemoryPrivateStateProvider();
  const providers = await buildProviders(connectedAPI, privateStateProvider);

  const secretKey = Uint8Array.from(
    (witness.secretKeyHex.match(/.{1,2}/g) ?? []).map((b) => parseInt(b, 16)),
  );

  onProgress("proving", "Generating zero-knowledge proof…");

  const deployed = await (findDeployedContract as unknown as (
    providers: unknown,
    options: unknown,
  ) => Promise<{ callTx: Record<string, (...args: unknown[]) => Promise<any>> }>)(providers, {
    contractAddress,
    compiledContract: CompiledGymProofContract,
    privateStateId: "gymproofPrivateState",
    initialPrivateState: createGymProofPrivateState(
      secretKey,
      [
        // Witness-only aggregates; the raw log never leaves the vault.
        {
          id: "aggregate",
          date: witness.windowEnd,
          durationMinutes: 0,
          bestLiftKg: witness.bestLiftKg,
        },
      ],
      { [challengeIdHex]: { start: witness.windowStart, end: witness.windowEnd } },
    ),
  });

  onProgress("awaiting-wallet", "Waiting for wallet confirmation…");

  const circuit = circuitFor(challenge);
  const call = deployed.callTx[circuit];
  if (!call) {
    throw new ContractUnavailableError(
      `The deployed contract does not expose the '${circuit}' circuit.`,
      "NOT_COMPILED",
    );
  }

  onProgress("submitting", "Submitting to Midnight…");
  const txData = await call(challengeIdHex);

  onProgress("verifying", "Verifying on Midnight…");
  const txHash: string = txData?.public?.txHash ?? "";
  if (!txHash) {
    throw new Error("Midnight did not return a transaction hash — verification is unconfirmed.");
  }

  onProgress("verified", "Achievement verified.");
  return {
    achievementId: `${challenge.id}-${txHash.slice(0, 16)}`,
    challengeId: challenge.id,
    txHash,
    contractAddress,
    network: midnightConfig.networkId,
    verifiedAt: Date.now(),
  };
};
