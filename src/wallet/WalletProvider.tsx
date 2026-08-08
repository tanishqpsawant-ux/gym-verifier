import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { midnightConfig } from "@/config/midnight";
import { LaceWalletAdapter } from "./LaceWalletAdapter";
import { OneAMWalletAdapter } from "./OneAMWalletAdapter";
import type { MidnightWalletAdapter, WalletConnection, WalletType } from "./walletTypes";
import { WalletError } from "./walletTypes";
import { WALLET_DESCRIPTORS, toWalletError } from "./walletUtils";

export type WalletAvailability = {
  readonly type: WalletType;
  readonly label: string;
  readonly description: string;
  readonly website: string;
  readonly available: boolean;
  /** Name reported by the extension itself, when present. */
  readonly detectedName?: string | undefined;
  readonly detectedIcon?: string | undefined;

};

export type WalletContextValue = {
  readonly wallet: WalletConnection | undefined;
  readonly walletType: WalletType | undefined;
  readonly address: string | undefined;
  readonly network: string | undefined;
  readonly expectedNetwork: string;
  readonly isConnected: boolean;
  readonly isConnecting: boolean;
  readonly isWrongNetwork: boolean;
  readonly error: WalletError | undefined;
  readonly availability: readonly WalletAvailability[];
  readonly adapter: MidnightWalletAdapter | undefined;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  switchWallet: (type: WalletType) => Promise<void>;
  clearError: () => void;
};

export const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const buildAdapters = (): Record<WalletType, MidnightWalletAdapter> => ({
  LACE: new LaceWalletAdapter(),
  "1AM": new OneAMWalletAdapter(),
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const adaptersRef = useRef<Record<WalletType, MidnightWalletAdapter>>(buildAdapters());
  const [wallet, setWallet] = useState<WalletConnection>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<WalletError>();
  const [availability, setAvailability] = useState<readonly WalletAvailability[]>(() =>
    (Object.keys(WALLET_DESCRIPTORS) as WalletType[]).map((type) => ({
      type,
      label: WALLET_DESCRIPTORS[type].label,
      description: WALLET_DESCRIPTORS[type].description,
      website: WALLET_DESCRIPTORS[type].website,
      available: false,
    })),
  );

  // Extensions inject asynchronously, so availability is polled briefly after
  // mount instead of being read once.
  useEffect(() => {
    let cancelled = false;
    const scan = () => {
      if (cancelled) return;
      setAvailability(
        (Object.keys(WALLET_DESCRIPTORS) as WalletType[]).map((type) => {
          const adapter = adaptersRef.current[type];
          const injected = adapter.detect();
          return {
            type,
            label: adapter.descriptor.label,
            description: adapter.descriptor.description,
            website: adapter.descriptor.website,
            available: injected !== undefined,
            detectedName: injected?.name,
            detectedIcon: injected?.icon,
          };
        }),
      );
    };
    scan();
    const handle = window.setInterval(scan, 1_000);
    const stop = window.setTimeout(() => window.clearInterval(handle), 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(handle);
      window.clearTimeout(stop);
    };
  }, []);

  const disconnect = useCallback(async () => {
    const current = wallet ? adaptersRef.current[wallet.type] : undefined;
    await current?.disconnect();
    setWallet(undefined);
    setError(undefined);
  }, [wallet]);

  const connect = useCallback(async (type: WalletType) => {
    setIsConnecting(true);
    setError(undefined);
    try {
      const connection = await adaptersRef.current[type].connect(midnightConfig.networkId);
      setWallet(connection);
    } catch (caught) {
      const walletError = toWalletError(caught, "Wallet connection failed.");
      setError(walletError);
      throw walletError;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const switchWallet = useCallback(
    async (type: WalletType) => {
      await disconnect();
      await connect(type);
    },
    [connect, disconnect],
  );

  // Detect a wallet that goes away (extension locked, permissions revoked).
  useEffect(() => {
    if (!wallet) return;
    const adapter = adaptersRef.current[wallet.type];
    const handle = window.setInterval(() => {
      void (async () => {
        const stillConnected = await (
          adapter as MidnightWalletAdapter & { refreshConnectionStatus?: () => Promise<boolean> }
        ).refreshConnectionStatus?.();
        if (stillConnected === false) {
          setWallet(undefined);
          setError(new WalletError("The wallet disconnected.", "DISCONNECTED"));
        }
      })();
    }, 15_000);
    return () => window.clearInterval(handle);
  }, [wallet]);

  const value = useMemo<WalletContextValue>(
    () => ({
      wallet,
      walletType: wallet?.type,
      address: wallet?.address,
      network: wallet?.network,
      expectedNetwork: midnightConfig.networkId,
      isConnected: wallet !== undefined,
      isConnecting,
      isWrongNetwork: wallet !== undefined && wallet.network !== midnightConfig.networkId,
      error,
      availability,
      adapter: wallet ? adaptersRef.current[wallet.type] : undefined,
      connect,
      disconnect,
      switchWallet,
      clearError: () => setError(undefined),
    }),
    [availability, connect, disconnect, error, isConnecting, switchWallet, wallet],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
