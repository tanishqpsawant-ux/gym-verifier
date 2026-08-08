/**
 * Midnight runtime layer.
 *
 * Mirrors `initializeProviders` from the reference bboard project:
 * the connected wallet supplies the indexer / prover configuration, the ZK
 * artifacts are fetched over HTTP, transactions are balanced and submitted by
 * the wallet, and private state never leaves the browser.
 *
 * Every Midnight package is imported dynamically so the module graph stays
 * out of the SSR bundle — these libraries are WASM-backed and browser-only.
 */
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";

import { midnightConfig } from "@/config/midnight";

/** Raised when the Compact artifacts have not been compiled/deployed yet. */
export class ContractUnavailableError extends Error {
  constructor(
    message: string,
    readonly reason: "NOT_COMPILED" | "NOT_DEPLOYED",
  ) {
    super(message);
    this.name = "ContractUnavailableError";
  }
}

export type GymProofProviders = {
  privateStateProvider: unknown;
  zkConfigProvider: unknown;
  proofProvider: unknown;
  publicDataProvider: unknown;
  walletProvider: unknown;
  midnightProvider: unknown;
};

/**
 * Loads the compiled GymProof contract module.
 *
 * The module is produced by `npm run compact` (Compact compiler) and is not
 * checked in, so the import is resolved at runtime. When it is absent we fail
 * loudly instead of pretending the chain is reachable.
 */
export const loadCompiledContract = async (): Promise<Record<string, unknown>> => {
  const modulePath = "/contract/src/index.js";
  try {
    return (await import(/* @vite-ignore */ modulePath)) as Record<string, unknown>;
  } catch (cause) {
    throw new ContractUnavailableError(
      "The GymProof Compact contract has not been compiled. Run `npm run compact` and serve the generated `managed/gymproof` artifacts before using on-chain features.",
      "NOT_COMPILED",
    );
  }
};

export const requireDeployedAddress = (): string => {
  if (!midnightConfig.contractAddress) {
    throw new ContractUnavailableError(
      "No GymProof contract address is configured. Deploy the contract and set VITE_CONTRACT_ADDRESS.",
      "NOT_DEPLOYED",
    );
  }
  return midnightConfig.contractAddress;
};

/**
 * Builds the Midnight provider set from a connected wallet, following the
 * bboard reference implementation one-for-one.
 */
export const buildProviders = async (
  connectedAPI: ConnectedAPI,
  privateStateProvider: unknown,
): Promise<GymProofProviders> => {
  const [
    { FetchZkConfigProvider },
    { httpClientProofProvider },
    { indexerPublicDataProvider },
    protocolCompactRuntime,
    ledger,
  ] = await Promise.all([
    import("@midnight-ntwrk/midnight-js-fetch-zk-config-provider"),
    import("@midnight-ntwrk/midnight-js-http-client-proof-provider"),
    import("@midnight-ntwrk/midnight-js-indexer-public-data-provider"),
    import("@midnight-ntwrk/midnight-js-protocol/compact-runtime"),
    import("@midnight-ntwrk/midnight-js-protocol/ledger"),
  ]);

  const { fromHex, toHex } = protocolCompactRuntime as unknown as {
    fromHex: (value: string) => Uint8Array;
    toHex: (value: Uint8Array) => string;
  };
  const { Transaction } = ledger as unknown as { Transaction: any };

  const config = await connectedAPI.getConfiguration();
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();

  const indexerUri = midnightConfig.indexerUri ?? config.indexerUri;
  const indexerWsUri = midnightConfig.indexerWsUri ?? config.indexerWsUri;
  const proverUri = midnightConfig.proofServerUri ?? config.proverServerUri;

  if (!proverUri) {
    throw new Error(
      "No proof server URI available. The connected wallet did not report one — set VITE_PROOF_SERVER_URI to a reachable Midnight proof server.",
    );
  }

  const zkConfigPath = midnightConfig.zkConfigBaseUri ?? window.location.origin;
  const keyMaterialProvider = new FetchZkConfigProvider(zkConfigPath, fetch.bind(window));

  return {
    privateStateProvider,
    zkConfigProvider: keyMaterialProvider,
    proofProvider: httpClientProofProvider(proverUri, keyMaterialProvider as never),
    publicDataProvider: indexerPublicDataProvider(indexerUri, indexerWsUri),
    walletProvider: {
      getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
      getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
      balanceTx: async (tx: { serialize: () => Uint8Array }) => {
        const received = await connectedAPI.balanceUnsealedTransaction(toHex(tx.serialize()));
        return Transaction.deserialize("signature", "proof", "binding", fromHex(received.tx));
      },
    },
    midnightProvider: {
      submitTx: async (tx: { serialize: () => Uint8Array; identifiers: () => string[] }) => {
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        return tx.identifiers()[0];
      },
    },
  };
};
