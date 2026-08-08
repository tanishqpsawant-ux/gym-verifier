import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";

import type {
  MidnightWalletAdapter,
  WalletConnection,
  WalletDescriptor,
  WalletType,
} from "./walletTypes";
import { WalletError } from "./walletTypes";
import { findWalletApi, toWalletError } from "./walletUtils";

/**
 * Shared implementation of the Midnight DApp Connector API v4 handshake.
 *
 * Both supported wallets (Lace and 1AM) implement the same standard connector
 * interface, so the protocol lives here and the product-specific adapters only
 * supply discovery metadata. Nothing here is wallet-proprietary or invented.
 */
export abstract class BaseConnectorAdapter implements MidnightWalletAdapter {
  #connected: ConnectedAPI | undefined;

  protected constructor(
    readonly type: WalletType,
    readonly descriptor: WalletDescriptor,
  ) {}

  detect(): InitialAPI | undefined {
    return findWalletApi(this.descriptor);
  }

  isAvailable(): boolean {
    return this.detect() !== undefined;
  }

  isConnected(): boolean {
    return this.#connected !== undefined;
  }

  getConnectedApi(): ConnectedAPI | undefined {
    return this.#connected;
  }

  async connect(networkId: string): Promise<WalletConnection> {
    const initial = this.detect();
    if (!initial) {
      throw new WalletError(
        `${this.descriptor.label} was not detected in this browser. Install the extension and reload.`,
        "NOT_INSTALLED",
      );
    }

    let connected: ConnectedAPI;
    try {
      connected = await initial.connect(networkId);
      // Ask for the permissions this DApp actually uses, up front.
      await connected.hintUsage([
        "getShieldedAddresses",
        "getConfiguration",
        "balanceUnsealedTransaction",
        "submitTransaction",
      ]);
    } catch (error) {
      throw toWalletError(error, `Could not connect to ${this.descriptor.label}.`);
    }

    try {
      const [addresses, configuration] = await Promise.all([
        connected.getShieldedAddresses(),
        connected.getConfiguration(),
      ]);
      this.#connected = connected;
      return {
        type: this.type,
        address: addresses.shieldedAddress,
        coinPublicKey: addresses.shieldedCoinPublicKey,
        encryptionPublicKey: addresses.shieldedEncryptionPublicKey,
        network: configuration.networkId,
        walletName: initial.name,
        walletIcon: initial.icon,
        api: connected,
      };
    } catch (error) {
      throw toWalletError(error, `${this.descriptor.label} did not return account details.`);
    }
  }

  async disconnect(): Promise<void> {
    // The connector API v4 has no explicit revoke call; the DApp drops its
    // reference and clears all wallet-derived state. Permissions remain with
    // the wallet, which is where the user revokes them.
    this.#connected = undefined;
    return Promise.resolve();
  }

  async getAddress(): Promise<string> {
    const api = this.#requireConnected();
    return (await api.getShieldedAddresses()).shieldedAddress;
  }

  async getNetwork(): Promise<string> {
    const api = this.#requireConnected();
    return (await api.getConfiguration()).networkId;
  }

  /** Returns the live connection status reported by the wallet. */
  async refreshConnectionStatus(): Promise<boolean> {
    const api = this.#connected;
    if (!api) return false;
    try {
      const status = await api.getConnectionStatus();
      return status !== undefined && status !== null;
    } catch {
      this.#connected = undefined;
      return false;
    }
  }

  #requireConnected(): ConnectedAPI {
    if (!this.#connected) {
      throw new WalletError(`${this.descriptor.label} is not connected.`, "DISCONNECTED");
    }
    return this.#connected;
  }
}
