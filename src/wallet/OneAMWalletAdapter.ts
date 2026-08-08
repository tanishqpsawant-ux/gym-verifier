import { BaseConnectorAdapter } from "./BaseConnectorAdapter";
import { WALLET_DESCRIPTORS } from "./walletUtils";

/**
 * 1AM Wallet adapter (https://1am.xyz).
 *
 * 1AM is a Midnight-native wallet and exposes the same standard
 * `@midnight-ntwrk/dapp-connector-api` interface under `window.midnight`, so
 * the handshake is identical to Lace's. No proprietary 1AM API is assumed:
 * the adapter only differs in how the injected provider is discovered
 * (`rdns` / `name` reported by the extension itself). If a future 1AM release
 * ships connector-specific extensions, they belong in this class only.
 */
export class OneAMWalletAdapter extends BaseConnectorAdapter {
  constructor() {
    super("1AM", WALLET_DESCRIPTORS["1AM"]);
  }
}
