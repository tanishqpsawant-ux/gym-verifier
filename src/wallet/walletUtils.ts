import type { InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import semver from "semver";

import { midnightConfig } from "@/config/midnight";
import type { WalletDescriptor, WalletType } from "./walletTypes";
import { WalletError } from "./walletTypes";

export const WALLET_DESCRIPTORS: Record<WalletType, WalletDescriptor> = {
  LACE: {
    type: "LACE",
    label: "Lace",
    description: "Connect using Lace Wallet",
    rdnsHints: ["io.lace", "com.lace", "lace"],
    nameHints: ["lace"],
    website: "https://www.lace.io/",
  },
  "1AM": {
    type: "1AM",
    label: "1AM",
    description: "Connect using 1AM Wallet",
    rdnsHints: ["xyz.1am", "com.1am", "1am"],
    nameHints: ["1am", "one am"],
    website: "https://1am.xyz",
  },
};

/**
 * Enumerates every DApp Connector API injected under `window.midnight`, as
 * described by the connector spec (CAIP-372 style discovery). Entries whose
 * `apiVersion` is outside the supported range are ignored, exactly as the
 * reference bboard implementation does.
 */
export const listInjectedWallets = (): Array<{ key: string; api: InitialAPI }> => {
  if (typeof window === "undefined" || !window.midnight) return [];
  return Object.entries(window.midnight)
    .filter((entry): entry is [string, InitialAPI] => {
      const api = entry[1];
      return (
        !!api &&
        typeof api === "object" &&
        "apiVersion" in api &&
        typeof api.connect === "function" &&
        isCompatible(api.apiVersion)
      );
    })
    .map(([key, api]) => ({ key, api }));
};

export const isCompatible = (apiVersion: string): boolean => {
  try {
    return semver.satisfies(apiVersion, midnightConfig.compatibleConnectorApiVersion);
  } catch {
    return false;
  }
};

/**
 * Resolves the injected connector belonging to a specific wallet product.
 * Matching is done against the values the wallet itself reports (`rdns`,
 * `name`, and the injection key) — no wallet API is assumed or invented.
 */
export const findWalletApi = (descriptor: WalletDescriptor): InitialAPI | undefined => {
  const candidates = listInjectedWallets();
  const matches = (value: string | undefined, hints: readonly string[]) =>
    !!value && hints.some((hint) => value.toLowerCase().includes(hint));

  return (
    candidates.find(({ api }) => matches(api.rdns, descriptor.rdnsHints))?.api ??
    candidates.find(({ api }) => matches(api.name, descriptor.nameHints))?.api ??
    candidates.find(({ key }) => matches(key, descriptor.nameHints))?.api
  );
};

/** Maps DApp Connector API errors onto GymProof's wallet error codes. */
export const toWalletError = (error: unknown, fallback: string): WalletError => {
  if (error instanceof WalletError) return error;
  const candidate = error as { type?: string; code?: string; message?: string } | undefined;
  if (candidate?.type === "DAppConnectorAPIError") {
    switch (candidate.code) {
      case "Rejected":
      case "PermissionRejected":
        return new WalletError("Connection request was rejected in the wallet.", "REJECTED", {
          cause: error,
        });
      case "Disconnected":
        return new WalletError("The wallet disconnected.", "DISCONNECTED", { cause: error });
      default:
        return new WalletError(candidate.message ?? fallback, "UNKNOWN", { cause: error });
    }
  }
  return new WalletError(
    error instanceof Error ? error.message : fallback,
    "UNKNOWN",
    { cause: error },
  );
};

/** `mn_shield-addr_test1abc...xyz9` -> `mn_shi...xyz9` */
export const shortenAddress = (address: string, lead = 6, tail = 4): string =>
  address.length <= lead + tail + 1 ? address : `${address.slice(0, lead)}…${address.slice(-tail)}`;
