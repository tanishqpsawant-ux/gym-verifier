import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Dumbbell,
  EyeOff,
  Fingerprint,
  Lock,
  ShieldCheck,
  Trophy,
} from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { midnightConfig } from "@/config/midnight";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GymProof — Private Fitness Proofs on Midnight" },
      {
        name: "description",
        content:
          "Track workouts privately and prove fitness achievements with zero-knowledge proofs on the Midnight blockchain. Your data never leaves your device.",
      },
      { property: "og:title", content: "GymProof — Private Fitness Proofs on Midnight" },
      {
        property: "og:description",
        content:
          "Zero-knowledge fitness verification: prove the achievement, publish nothing else.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Lock,
    title: "Private by construction",
    body: "Workouts, sets, and body data live in your browser vault. They are witness inputs to a circuit — never ledger state.",
  },
  {
    icon: ShieldCheck,
    title: "Real zero-knowledge proofs",
    body: "Compact circuits assert your requirement. The Midnight proof server produces the proof; the chain verifies it.",
  },
  {
    icon: EyeOff,
    title: "Anonymous leaderboard",
    body: "Ranks are built from verified achievement commitments, not from identities or raw workout logs.",
  },
  {
    icon: Fingerprint,
    title: "Wallet-native",
    body: "Lace and 1AM via the Midnight DApp Connector API v4. Your keys stay inside the extension.",
  },
];

const STEPS = [
  { title: "Log privately", body: "Record workouts, sets, and PRs into your local encrypted vault." },
  { title: "Join a challenge", body: "Pick a public challenge with a fixed, checkable requirement." },
  { title: "Prove it", body: "A ZK circuit checks your private data and produces a proof." },
  { title: "Get verified", body: "Midnight verifies the proof; only the achievement becomes public." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <AppHeader />

      <main>
        <section className="bg-hero relative overflow-hidden">
          <div className="grid-noise absolute inset-0 opacity-60" aria-hidden />
          <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
            <Badge variant="outline" className="border-accent/40 text-accent">
              Built on Midnight · {midnightConfig.networkLabel}
            </Badge>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Prove your progress.
              <br />
              <span className="text-gradient-primary">Reveal nothing else.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              GymProof is a privacy-first training log. Your workouts stay on your device; zero-knowledge
              proofs on Midnight let you verify streaks, consistency, and strength milestones without
              publishing a single rep.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/dashboard">
                  Open dashboard <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/challenges">Browse challenges</Link>
              </Button>
            </div>

            <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ["0", "bytes of workout data on-chain"],
                ["ZK", "circuit-verified achievements"],
                ["v4", "DApp Connector API"],
                ["2", "supported wallets"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-3xl font-bold text-primary">{value}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Privacy is the feature, not a setting
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="bg-panel border-border/70 p-6 shadow-panel">
                <feature.icon className="size-6 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border/70 bg-surface/40">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">How a proof happens</h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="rounded-xl border border-border/70 bg-card p-6">
                  <span className="font-mono text-sm text-accent">0{index + 1}</span>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Dumbbell, title: "Workout logging", body: "Exercises, sets, reps, weights, rest, notes — with PR detection.", to: "/workouts" as const },
              { icon: Trophy, title: "Challenges", body: "Streaks, consistency, and strength milestones with ZK verification.", to: "/challenges" as const },
              { icon: Activity, title: "Anonymous ranking", body: "Compete on verified achievements without revealing identity.", to: "/leaderboard" as const },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group rounded-xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/60"
              >
                <item.icon className="size-6 text-accent" />
                <h3 className="mt-4 flex items-center gap-2 text-lg font-semibold">
                  {item.title}
                  <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:px-6">
          <span>GymProof — zero-knowledge fitness verification on Midnight.</span>
          <span className="font-mono">{midnightConfig.networkLabel}</span>
        </div>
      </footer>
    </div>
  );
}
