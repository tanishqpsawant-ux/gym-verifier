import type { PrivateVault, Workout } from "@/types/gymproof";

const STORAGE_KEY = "gymproof:vault:v1";

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export const fromHex = (hex: string): Uint8Array =>
  new Uint8Array((hex.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16)));

const createVault = (): PrivateVault => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return { secretKeyHex: toHex(bytes), workouts: [], joined: [], achievements: [] };
};

/**
 * The private vault: every detail of the athlete's training lives here, in the
 * browser only. It is the witness source for the Compact circuits and is never
 * uploaded, published, or written to the ledger.
 */
export const loadVault = (): PrivateVault => {
  if (typeof window === "undefined") return createVault();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = createVault();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<PrivateVault>;
    return {
      secretKeyHex: parsed.secretKeyHex ?? createVault().secretKeyHex,
      ...(parsed.profile ? { profile: parsed.profile } : {}),
      workouts: parsed.workouts ?? [],
      joined: parsed.joined ?? [],
      achievements: parsed.achievements ?? [],
    };
  } catch {
    return createVault();
  }
};

export const saveVault = (vault: PrivateVault): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
};

export const clearVault = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};

/* ---------------- Derived private statistics (never published) ------------ */

export const completedWorkouts = (workouts: Workout[]): Workout[] =>
  workouts.filter((w) => w.completed);

export const workoutsInWindow = (workouts: Workout[], start: number, end: number): number =>
  completedWorkouts(workouts).filter((w) => w.date >= start && w.date <= end).length;

export const longestStreak = (workouts: Workout[]): number => {
  const days = Array.from(
    new Set(completedWorkouts(workouts).map((w) => Math.floor(w.date / 86_400_000))),
  ).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev: number | undefined;
  for (const day of days) {
    run = prev !== undefined && day === prev + 1 ? run + 1 : 1;
    prev = day;
    if (run > best) best = run;
  }
  return best;
};

export const currentStreak = (workouts: Workout[]): number => {
  const days = new Set(
    completedWorkouts(workouts).map((w) => Math.floor(w.date / 86_400_000)),
  );
  let day = Math.floor(Date.now() / 86_400_000);
  if (!days.has(day)) day -= 1;
  let streak = 0;
  while (days.has(day)) {
    streak += 1;
    day -= 1;
  }
  return streak;
};

export const bestLiftKg = (workouts: Workout[]): number =>
  completedWorkouts(workouts).reduce(
    (max, w) =>
      Math.max(
        max,
        ...w.exercises.flatMap((e) => e.sets.map((s) => s.weightKg)),
        0,
      ),
    0,
  );

export const personalRecords = (workouts: Workout[]) => {
  const records = new Map<string, { current: number; previous: number }>();
  for (const workout of completedWorkouts(workouts).sort((a, b) => a.date - b.date)) {
    for (const exercise of workout.exercises) {
      const heaviest = Math.max(0, ...exercise.sets.map((s) => s.weightKg));
      if (heaviest <= 0) continue;
      const existing = records.get(exercise.name);
      if (!existing) {
        records.set(exercise.name, { current: heaviest, previous: heaviest });
      } else if (heaviest > existing.current) {
        records.set(exercise.name, { current: heaviest, previous: existing.current });
      }
    }
  }
  return Array.from(records.entries()).map(([name, value]) => ({ name, ...value }));
};

export const volumeByWeek = (workouts: Workout[], weeks = 8) => {
  const now = Date.now();
  return Array.from({ length: weeks }, (_, index) => {
    const end = now - index * 7 * 86_400_000;
    const start = end - 7 * 86_400_000;
    const inRange = completedWorkouts(workouts).filter((w) => w.date > start && w.date <= end);
    const volume = inRange.reduce(
      (sum, w) =>
        sum +
        w.exercises.reduce(
          (exerciseSum, e) =>
            exerciseSum + e.sets.reduce((setSum, s) => setSum + s.weightKg * s.reps, 0),
          0,
        ),
      0,
    );
    return {
      label: `W-${weeks - index - 1}`,
      sessions: inRange.length,
      volume: Math.round(volume),
    };
  }).reverse();
};

export const muscleDistribution = (workouts: Workout[]) => {
  const counts = new Map<string, number>();
  for (const workout of completedWorkouts(workouts)) {
    for (const group of workout.muscleGroups) {
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
};
