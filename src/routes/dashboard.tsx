import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  CalendarCheck,
  Clock,
  Dumbbell,
  Flame,
  Lock,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatCard } from "@/components/common/StatCard";
import { AppHeader } from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGymProof } from "@/hooks/useGymProof";
import { muscleDistribution, personalRecords, volumeByWeek } from "@/lib/privateStore";
import { CHALLENGES } from "@/services/challengeService";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GymProof" },
      {
        name: "description",
        content:
          "Your private training dashboard: streaks, weekly volume, personal records, and challenge progress — all stored locally.",
      },
      { property: "og:title", content: "Dashboard — GymProof" },
      { property: "og:description", content: "Private training stats, local to your device." },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Dashboard() {
  const { stats, workouts, achievements, joined, progressFor, profile } = useGymProof();
  const volume = volumeByWeek(workouts);
  const distribution = muscleDistribution(workouts);
  const records = personalRecords(workouts).slice(0, 5);
  const activeChallenges = CHALLENGES.filter((challenge) =>
    joined.some((entry) => entry.challengeId === challenge.id),
  );

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              {profile ? `Welcome back, ${profile.displayName}` : "Your training vault"}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="size-4 text-accent" />
              Everything on this page is computed locally and never leaves your device.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/workouts">
              <Dumbbell className="size-4" /> Log a workout
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Flame} label="Current streak" value={`${stats.streak}d`} hint={`Longest ${stats.longest}d`} tone="primary" />
          <StatCard icon={CalendarCheck} label="This week" value={stats.thisWeek} hint={`${stats.total} total sessions`} />
          <StatCard icon={Clock} label="Training time" value={`${Math.round(stats.minutes / 60)}h`} hint={`${stats.minutes} minutes logged`} />
          <StatCard icon={ShieldCheck} label="Verified proofs" value={achievements.length} hint="Confirmed on Midnight" tone="accent" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="bg-panel border-border/70 p-6 shadow-panel lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Weekly volume</h2>
              <Badge variant="outline" className="text-muted-foreground">Private</Badge>
            </div>
            <div className="mt-6 h-64">
              {workouts.length === 0 ? (
                <EmptyChart label="Log a workout to see your volume trend." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volume}>
                    <defs>
                      <linearGradient id="volume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        color: "var(--color-popover-foreground)",
                      }}
                    />
                    <Area type="monotone" dataKey="volume" stroke="var(--color-chart-1)" fill="url(#volume)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="bg-panel border-border/70 p-6 shadow-panel">
            <h2 className="font-display text-lg font-semibold">Muscle split</h2>
            <div className="mt-6 h-64">
              {distribution.length === 0 ? (
                <EmptyChart label="No sessions logged yet." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {distribution.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="bg-panel border-border/70 p-6 shadow-panel">
            <h2 className="font-display text-lg font-semibold">Active challenges</h2>
            {activeChallenges.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                You haven&apos;t joined a challenge yet.{" "}
                <Link to="/challenges" className="text-primary underline-offset-4 hover:underline">
                  Browse challenges
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {activeChallenges.map((challenge) => {
                  const progress = progressFor(challenge);
                  return (
                    <li key={challenge.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{challenge.title}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {progress.value}/{progress.target}
                        </span>
                      </div>
                      <Progress value={progress.percent} className="mt-2" />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="bg-panel border-border/70 p-6 shadow-panel">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Trophy className="size-4 text-primary" /> Personal records
            </h2>
            {records.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Log weighted sets to track PRs.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border/70">
                {records.map((record) => (
                  <li key={record.name} className="flex items-center justify-between py-2.5 text-sm">
                    <span>{record.name}</span>
                    <span className="font-mono">{record.current} kg</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card className="mt-6 flex flex-wrap items-center gap-4 border-accent/30 bg-accent/5 p-6">
          <Activity className="size-6 text-accent" />
          <p className="flex-1 text-sm text-muted-foreground">
            Ready to turn this progress into a verifiable achievement? Proofs are generated from these
            same private numbers — nothing else is disclosed.
          </p>
          <Button asChild variant="secondary">
            <Link to="/challenges">Generate a proof</Link>
          </Button>
        </Card>
      </main>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  );
}
