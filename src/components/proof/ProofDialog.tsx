import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGymProof } from "@/hooks/useGymProof";
import { useWallet } from "@/hooks/useWallet";
import { bestLiftKg, longestStreak, workoutsInWindow } from "@/lib/privateStore";
import { cn } from "@/lib/utils";
import { ContractUnavailableError } from "@/services/midnightService";
import { evaluateRequirement, proveAchievement } from "@/services/proofService";
import type { Challenge, ProofStage } from "@/types/gymproof";

const STAGES: { key: ProofStage; label: string; detail: string }[] = [
  { key: "preparing", label: "Reading private vault", detail: "Witness values stay local" },
  { key: "proving", label: "Generating ZK proof", detail: "Proof server, no raw data" },
  { key: "awaiting-wallet", label: "Wallet signature", detail: "Balance + sign transaction" },
  { key: "submitting", label: "Submitting to Midnight", detail: "Shielded transaction" },
  { key: "verifying", label: "On-chain verification", detail: "Circuit assertions checked" },
];

const order: ProofStage[] = [
  "idle",
  "preparing",
  "proving",
  "awaiting-wallet",
  "submitting",
  "verifying",
  "verified",
];

export function ProofDialog({
  challenge,
  open,
  onOpenChange,
}: {
  challenge: Challenge;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { vault, recordAchievement, progressFor } = useGymProof();
  const { wallet, isConnected, isWrongNetwork } = useWallet();
  const [stage, setStage] = useState<ProofStage>("idle");
  const [message, setMessage] = useState<string>();
  const [txHash, setTxHash] = useState<string>();

  const joined = progressFor(challenge).joined;
  const windowStart = joined?.start ?? Date.now() - challenge.windowDays * 86_400_000;
  const windowEnd = joined?.end ?? Date.now();

  const witness = {
    secretKeyHex: vault.secretKeyHex,
    workoutsInWindow: workoutsInWindow(vault.workouts, windowStart, windowEnd),
    longestStreak: longestStreak(vault.workouts),
    bestLiftKg: bestLiftKg(vault.workouts),
    windowStart,
    windowEnd,
  };
  const local = evaluateRequirement(challenge, witness);
  const running = stage !== "idle" && stage !== "verified" && stage !== "failed";

  const run = async () => {
    if (!wallet) return;
    setTxHash(undefined);
    setMessage(undefined);
    try {
      const achievement = await proveAchievement(challenge, witness, wallet.api, (next, detail) => {
        setStage(next);
        if (detail) setMessage(detail);
      });
      setTxHash(achievement.txHash);
      recordAchievement(achievement);
      toast.success("Achievement verified on Midnight");
    } catch (caught) {
      setStage("failed");
      const detail =
        caught instanceof ContractUnavailableError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : "Proof generation failed.";
      setMessage(detail);
      toast.error("Proof not completed", { description: detail });
    }
  };

  const stageIndex = order.indexOf(stage);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (running) return;
        if (!next) {
          setStage("idle");
          setMessage(undefined);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-accent" />
            Prove: {challenge.title}
          </DialogTitle>
          <DialogDescription>
            The circuit checks <span className="text-foreground">{challenge.requirement}</span>{" "}
            against private witnesses. Midnight learns only that the requirement holds.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Private witnesses (never published)
          </p>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Workouts</dt>
              <dd className="font-mono">{witness.workoutsInWindow}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Best streak</dt>
              <dd className="font-mono">{witness.longestStreak}d</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Best lift</dt>
              <dd className="font-mono">{witness.bestLiftKg}kg</dd>
            </div>
          </dl>
        </div>

        <ol className="space-y-2">
          {STAGES.map((item, index) => {
            const itemIndex = order.indexOf(item.key);
            const active = stage === item.key;
            const done = stageIndex > itemIndex && stage !== "failed";
            return (
              <li
                key={item.key}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm",
                  active && "border-accent/40 bg-accent/10",
                  done && "text-muted-foreground",
                )}
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs">
                  {done ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : active ? (
                    <Loader2 className="size-4 animate-spin text-accent" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="flex-1">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.detail}</span>
              </li>
            );
          })}
        </ol>

        {stage === "verified" && txHash ? (
          <div className="rounded-xl border border-success/40 bg-success/10 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium text-success">
              <CheckCircle2 className="size-4" /> Verified on Midnight
            </p>
            <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{txHash}</p>
          </div>
        ) : null}

        {stage === "failed" && message ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium text-destructive">
              <AlertTriangle className="size-4" /> Not verified
            </p>
            <p className="mt-1 text-muted-foreground">{message}</p>
          </div>
        ) : null}

        {!local.satisfied && stage === "idle" ? (
          <p className="text-sm text-warning">{local.reason}</p>
        ) : null}

        <DialogFooter className="gap-2">
          <Button variant="ghost" disabled={running} onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => void run()}
            disabled={running || !isConnected || isWrongNetwork || !local.satisfied}
            className="gap-2"
          >
            {running ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            {isConnected ? "Generate proof" : "Connect wallet first"}
          </Button>
        </DialogFooter>

        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <ExternalLink className="size-3" />
          Requires the compiled Compact contract, a deployed contract address, and a reachable proof
          server.
        </p>
      </DialogContent>
    </Dialog>
  );
}
