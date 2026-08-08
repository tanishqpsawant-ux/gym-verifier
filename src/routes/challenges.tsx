import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Flame, Lock, ShieldCheck, Target, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProofDialog } from "@/components/proof/ProofDialog";
import { AppHeader } from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { midnightConfig, isContractConfigured } from "@/config/midnight";
import { useGymProof } from "@/hooks/useGymProof";
import { useWallet } from "@/hooks/useWallet";
import { CHALLENGES } from "@/services/challengeService";
import type { Challenge } from "@/types/gymproof";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Challenges — GymProof" },
      {
        name: "description",
        content:
          "Join fitness challenges and prove completion with zero-knowledge proofs verified on the Midnight blockchain.",
      },
      { property: "og:title", content: "Challenges — GymProof" },
      {
        property: "og:description",
        content: "Prove streaks, consistency and strength without revealing your training data.",
      },
    ],
  }),
  component: Challenges,
});

const KIND_ICON = { COUNT: Target, STREAK: Flame, STRENGTH: Trophy } as const;

function Challenges() {
  const { joinChallenge, leaveChallenge, progressFor } = useGymProof();
  const { isConnected } = useWallet();
  const [proving, setProving] = useState<Challenge>();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Challenges</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Each challenge maps to a Compact circuit with a fixed requirement. Your progress is computed
          locally; only a verified proof ever reaches the ledger.
        </p>

        {!isContractConfigured() ? (
          <Card className="mt-6 border-warning/40 bg-warning/10 p-4 text-sm text-muted-foreground">
            <span className="font-medium text-warning">Contract not configured. </span>
            Deploy the GymProof Compact contract and set <code className="font-mono">VITE_CONTRACT_ADDRESS</code> (network{" "}
            <code className="font-mono">{midnightConfig.networkId}</code>) to enable on-chain proof
            verification. Progress tracking works without it.
          </Card>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CHALLENGES.map((challenge) => {
            const progress = progressFor(challenge);
            const Icon = KIND_ICON[challenge.kind];
            const isJoined = Boolean(progress.joined);
            const isVerified = Boolean(progress.verified);

            return (
              <Card key={challenge.id} className="bg-panel flex flex-col border-border/70 p-6 shadow-panel">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="size-5" />
                  </span>
                  {isVerified ? (
                    <Badge className="gap-1 border-success/40 bg-success/15 text-success" variant="outline">
                      <CheckCircle2 className="size-3" /> Verified
                    </Badge>
                  ) : isJoined ? (
                    <Badge variant="secondary">Joined</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {challenge.windowDays}d window
                    </Badge>
                  )}
                </div>

                <h2 className="mt-4 font-display text-xl font-semibold">{challenge.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{challenge.description}</p>

                <div className="mt-4 rounded-lg bg-surface px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Requirement: </span>
                  {challenge.requirement}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Your private progress</span>
                    <span className="font-mono">
                      {progress.value}/{progress.target}
                    </span>
                  </div>
                  <Progress value={progress.percent} className="mt-2" />
                </div>

                <div className="mt-6 flex gap-2">
                  {isJoined ? (
                    <>
                      <Button
                        className="flex-1 gap-2"
                        disabled={!isConnected || isVerified}
                        onClick={() => setProving(challenge)}
                      >
                        <ShieldCheck className="size-4" />
                        {isVerified ? "Proved" : "Prove"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          leaveChallenge(challenge.id);
                          toast.success("Left challenge");
                        }}
                      >
                        Leave
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="flex-1"
                      variant="secondary"
                      onClick={() => {
                        joinChallenge(challenge);
                        toast.success(`Joined ${challenge.title}`);
                      }}
                    >
                      Join challenge
                    </Button>
                  )}
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Lock className="size-3 text-accent" /> Reward: {challenge.reward}
                </p>
              </Card>
            );
          })}
        </div>
      </main>

      {proving ? (
        <ProofDialog
          challenge={proving}
          open={Boolean(proving)}
          onOpenChange={(next) => {
            if (!next) setProving(undefined);
          }}
        />
      ) : null}
    </div>
  );
}
