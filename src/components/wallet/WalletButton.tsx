import { Check, ChevronDown, Copy, LogOut, Shield, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/hooks/useWallet";
import type { WalletType } from "@/wallet/walletTypes";

const shorten = (address: string) =>
  address.length > 16 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address;

export function WalletButton() {
  const {
    address,
    availability,
    connect,
    disconnect,
    error,
    isConnected,
    isConnecting,
    isWrongNetwork,
    expectedNetwork,
    network,
    wallet,
  } = useWallet();
  const [open, setOpen] = useState(false);

  const handleConnect = async (type: WalletType) => {
    try {
      await connect(type);
      setOpen(false);
      toast.success("Wallet connected", { description: "Your keys never leave the extension." });
    } catch (caught) {
      toast.error("Connection failed", {
        description: caught instanceof Error ? caught.message : "Unknown wallet error.",
      });
    }
  };

  if (isConnected && wallet) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="gap-2 font-mono text-xs">
            <span className="size-2 rounded-full bg-success" />
            {shorten(address ?? "")}
            <ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>{wallet.walletName}</span>
            <Badge variant={isWrongNetwork ? "destructive" : "outline"}>
              {network ?? expectedNetwork}
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground">Shielded address</p>
            <p className="mt-1 break-all font-mono text-[11px] leading-relaxed">{address}</p>
          </div>
          {isWrongNetwork ? (
            <p className="px-2 pb-2 text-xs text-destructive">
              Wallet is on {network}. Switch to {expectedNetwork} to submit proofs.
            </p>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              void navigator.clipboard.writeText(address ?? "");
              toast.success("Address copied");
            }}
          >
            <Copy className="size-4" /> Copy address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void disconnect()}>
            <LogOut className="size-4" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={isConnecting} className="gap-2">
        <Wallet className="size-4" />
        {isConnecting ? "Connecting…" : "Connect wallet"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect a Midnight wallet</DialogTitle>
            <DialogDescription>
              GymProof speaks the Midnight DApp Connector API v4. Your workout data stays in this
              browser — the wallet only balances and signs proof transactions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {availability.map((entry) => (
              <button
                key={entry.type}
                type="button"
                disabled={!entry.available || isConnecting}
                onClick={() => void handleConnect(entry.type)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary/60 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-55"
              >
                {entry.detectedIcon ? (
                  <img src={entry.detectedIcon} alt="" className="size-9 rounded-lg" />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Wallet className="size-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-medium">
                    {entry.detectedName ?? entry.label}
                    {entry.available ? (
                      <Badge variant="outline" className="border-success/40 text-success">
                        <Check className="mr-1 size-3" /> Detected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Not installed
                      </Badge>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {entry.available ? entry.description : `Install from ${entry.website}`}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {error ? <p className="text-sm text-destructive">{error.message}</p> : null}

          <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <Shield className="mt-0.5 size-4 shrink-0 text-accent" />
            Expected network: <span className="font-mono">{expectedNetwork}</span>. Proof generation
            requires a reachable Midnight proof server.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
