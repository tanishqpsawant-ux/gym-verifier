import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";

/** The two wallets GymProof supports. */
export type WalletType = "LACE" | "1AM";

export type WalletDescriptor = {
  readonly type: WalletType;
  /** Human label used in the UI. */
  readonly label: string;
  /** Short description shown on the connect card. */
  readonly description: string;
  /** Reverse-DNS identifiers the wallet is known to inject itself under. */
  readonly rdnsHints: readonly string[];
  /** Fallback substrings matched against the injected wallet `name`. */
  readonly nameHints: readonly string[];
  /** Documentation / install page. */
  readonly website: string;
};

export type WalletConnection = {
  readonly type: WalletType;
  /** Bech32m shielded address reported by the wallet. */
  readonly address: string;
  readonly coinPublicKey: string;
  readonly encryptionPublicKey: string;
  readonly network: string;
  readonly walletName: string;
  readonly walletIcon?: string;
  readonly api: ConnectedAPI;
};

/**
 * Uniform interface over Midnight-compatible browser wallets. The UI never
 * touches wallet-specific code; only adapters do.
 */
export interface MidnightWalletAdapter {
  readonly type: WalletType;
  readonly descriptor: WalletDescriptor;
  /** The injected connector API, if the extension is present. */
  detect(): InitialAPI | undefined;
  isAvailable(): boolean;
  isConnected(): boolean;
  connect(networkId: string): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  getAddress(): Promise<string>;
  getNetwork(): Promise<string>;
  getConnectedApi(): ConnectedAPI | undefined;
}

export class WalletError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NOT_INSTALLED"
      | "INCOMPATIBLE"
      | "REJECTED"
      | "DISCONNECTED"
      | "WRONG_NETWORK"
      | "UNKNOWN",
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "WalletError";
  }
}
