import { useContext } from "react";

import { WalletContext, type WalletContextValue } from "@/wallet/WalletProvider";

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside <WalletProvider>");
  return context;
};
