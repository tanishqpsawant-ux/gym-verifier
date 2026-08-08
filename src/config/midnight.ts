/**
 * Environment-driven Midnight configuration.
 *
 * Defaults follow the reference bboard project: the wallet's own
 * `getConfiguration()` supplies indexer/prover URIs, and env vars override
 * them when a project pins its own infrastructure.
 */

export type NetworkId = string;

const env = import.meta.env as Record<string, string | undefined>;

export const midnightConfig = {
  /** 'testnet' | 'preview' | 'preprod' | 'undeployed' | 'mainnet' */
  networkId: env["VITE_NETWORK_ID"] ?? "testnet",
  networkLabel: env["VITE_NETWORK_LABEL"] ?? "Midnight Testnet",
  /** Deployed GymProof contract address (hex). Required to interact on-chain. */
  contractAddress: env["VITE_CONTRACT_ADDRESS"] ?? "",
  /** Overrides for the URIs reported by the wallet. */
  indexerUri: env["VITE_INDEXER_URI"],
  indexerWsUri: env["VITE_INDEXER_WS_URI"],
  proofServerUri: env["VITE_PROOF_SERVER_URI"],
  /** Base URL that serves the compiled `keys/` and `zkir/` ZK artifacts. */
  zkConfigBaseUri: env["VITE_ZK_CONFIG_URI"],
  /** Connector API version range this DApp speaks (matches the reference). */
  compatibleConnectorApiVersion: "4.x",
  /** UI-only sample data; never produces transactions or verifications. */
  demoMode: env["VITE_DEMO_MODE"] === "true",
} as const;

export const isContractConfigured = (): boolean => midnightConfig.contractAddress.length > 0;
