import { BaseConnectorAdapter } from "./BaseConnectorAdapter";
import { WALLET_DESCRIPTORS } from "./walletUtils";

/**
 * Lace Wallet adapter.
 *
 * Lace injects a standard Midnight DApp Connector API under `window.midnight`,
 * which is exactly the integration the reference bboard project uses.
 */
export class LaceWalletAdapter extends BaseConnectorAdapter {
  constructor() {
    super("LACE", WALLET_DESCRIPTORS.LACE);
  }
}
