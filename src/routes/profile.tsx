import { createFileRoute } from "@tanstack/react-router";
import { Fingerprint, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGymProof } from "@/hooks/useGymProof";
import { useWallet } from "@/hooks/useWallet";
import type { AthleteProfile, PrivacyMode } from "@/types/gymproof";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Athlete Profile — GymProof" },
      {
        name: "description",
        content:
          "Configure your GymProof athlete profile and privacy mode. Profile data is stored locally and never published without a proof.",
      },
      { property: "og:title", content: "Athlete Profile — GymProof" },
      { property: "og:description", content: "Your athlete identity, private by default." },
    ],
  }),
  component: Profile,
});

const PRIVACY: { value: PrivacyMode; label: string; body: string }[] = [
  { value: "PRIVATE", label: "Private", body: "Nothing is shared. Proofs stay in your vault." },
  { value: "ANONYMOUS", label: "Anonymous", body: "Verified achievements appear without identity." },
  { value: "PUBLIC", label: "Public", body: "Verified achievements appear with your display name." },
];

function Profile() {
  const { profile, saveProfile, stats, achievements, resetVault, ready } = useGymProof();
  const { address, wallet } = useWallet();

  const [form, setForm] = useState<AthleteProfile>({
    username: "",
    displayName: "",
    avatar: "",
    goal: "",
    experience: "intermediate",
    style: "",
    privacy: "ANONYMOUS",
    createdAt: Date.now(),
  });

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  if (!ready) return null;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Athlete profile</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-4 text-accent" /> Stored in your local vault. Publishing anything
          requires an explicit, verified proof.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card className="bg-panel border-border/70 p-6 shadow-panel lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="display-name">Display name</Label>
                <Input
                  id="display-name"
                  value={form.displayName}
                  onChange={(event) => setForm({ ...form, displayName: event.target.value })}
                  placeholder="Iron Ghost"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="username">Handle</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(event) => setForm({ ...form, username: event.target.value })}
                  placeholder="ironghost"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Experience</Label>
                <Select
                  value={form.experience}
                  onValueChange={(value) =>
                    setForm({ ...form, experience: value as AthleteProfile["experience"] })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="style">Training style</Label>
                <Input
                  id="style"
                  value={form.style}
                  onChange={(event) => setForm({ ...form, style: event.target.value })}
                  placeholder="Powerbuilding"
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="goal">Current goal</Label>
                <Textarea
                  id="goal"
                  value={form.goal}
                  onChange={(event) => setForm({ ...form, goal: event.target.value })}
                  placeholder="Hit a 180kg deadlift while training 4x per week."
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="mt-6">
              <Label>Privacy mode</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {PRIVACY.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm({ ...form, privacy: option.value })}
                    className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                      form.privacy === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{option.body}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="mt-6"
              onClick={() => {
                saveProfile({ ...form, createdAt: profile?.createdAt ?? Date.now() });
                toast.success("Profile saved locally");
              }}
            >
              Save profile
            </Button>
          </Card>

          <div className="space-y-4">
            <Card className="bg-panel border-border/70 p-6 shadow-panel">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Fingerprint className="size-4 text-accent" /> Identity
              </h2>
              <p className="mt-3 text-xs text-muted-foreground">Connected wallet</p>
              <p className="mt-1 break-all font-mono text-[11px]">
                {address ?? "Not connected"}
              </p>
              {wallet ? (
                <Badge variant="outline" className="mt-3">
                  {wallet.walletName}
                </Badge>
              ) : null}
            </Card>

            <Card className="bg-panel border-border/70 p-6 shadow-panel">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <ShieldCheck className="size-4 text-primary" /> Vault summary
              </h2>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Workouts" value={stats.total} />
                <Row label="Longest streak" value={`${stats.longest}d`} />
                <Row label="Best lift" value={`${stats.bestLift} kg`} />
                <Row label="Verified proofs" value={achievements.length} />
              </dl>
            </Card>

            <Card className="border-destructive/40 bg-destructive/5 p-6">
              <h2 className="font-display text-lg font-semibold text-destructive">Danger zone</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Erases your local vault: profile, workouts, joined challenges, and recorded proofs.
                On-chain verifications remain on Midnight.
              </p>
              <Button
                variant="destructive"
                className="mt-4 gap-2"
                onClick={() => {
                  resetVault();
                  toast.success("Local vault erased");
                }}
              >
                <Trash2 className="size-4" /> Erase vault
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
