import { createFileRoute } from "@tanstack/react-router";
import { EyeOff, Medal, ShieldCheck, Trophy } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { midnightConfig } from "@/config/midnight";
import { useGymProof } from "@/hooks/useGymProof";
import { CHALLENGES, findChallenge } from "@/services/challengeService";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Anonymous Leaderboard — GymProof" },
      {
        name: "description",
        content:
          "An anonymous leaderboard built from zero-knowledge verified achievements on Midnight — rankings without identities.",
      },
      { property: "og:title", content: "Anonymous Leaderboard — GymProof" },
      { property: "og:description", content: "Ranked by verified proofs, not by identity." },
    ],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const { achievements } = useGymProof();

  const byChallenge = CHALLENGES.map((challenge) => ({
    challenge,
    verified: achievements.filter((a) => a.challengeId === challenge.id).length,
  }));

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Anonymous leaderboard</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <EyeOff className="size-4 text-accent" />
          Entries are anonymous achievement commitments read from the Midnight ledger — no names, no
          addresses, no workout data.
        </p>

        <Card className="mt-8 border-accent/30 bg-accent/5 p-5 text-sm text-muted-foreground">
          Global rankings are read from the deployed GymProof contract on{" "}
          <span className="font-mono text-foreground">{midnightConfig.networkLabel}</span>. Until a
          contract address is configured and indexed, only your own verified proofs are shown — this
          app never fabricates leaderboard entries.
        </Card>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card className="bg-panel border-border/70 p-6 shadow-panel lg:col-span-2">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <ShieldCheck className="size-4 text-primary" /> Your verified achievements
            </h2>
            {achievements.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No verified proofs yet. Complete a challenge and generate a zero-knowledge proof to
                appear here.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border/70">
                {achievements
                  .slice()
                  .sort((a, b) => b.verifiedAt - a.verifiedAt)
                  .map((achievement, index) => {
                    const challenge = findChallenge(achievement.challengeId);
                    return (
                      <li key={achievement.achievementId} className="flex items-center gap-4 py-4">
                        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 font-mono text-sm text-primary">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{challenge?.title ?? "Achievement"}</p>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            {achievement.txHash}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-success/40 text-success">
                          Verified
                        </Badge>
                      </li>
                    );
                  })}
              </ul>
            )}
          </Card>

          <Card className="bg-panel border-border/70 p-6 shadow-panel">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Trophy className="size-4 text-primary" /> Challenge board
            </h2>
            <ul className="mt-4 space-y-3">
              {byChallenge.map(({ challenge, verified }) => (
                <li
                  key={challenge.id}
                  className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Medal className="size-4 text-muted-foreground" />
                    {challenge.title}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{verified}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
