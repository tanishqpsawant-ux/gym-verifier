import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  bestLiftKg,
  clearVault,
  completedWorkouts,
  currentStreak,
  loadVault,
  longestStreak,
  saveVault,
  workoutsInWindow,
} from "@/lib/privateStore";
import { CHALLENGES } from "@/services/challengeService";
import type {
  AthleteProfile,
  Challenge,
  JoinedChallenge,
  PrivateVault,
  VerifiedAchievement,
  Workout,
} from "@/types/gymproof";

type GymProofContextValue = {
  ready: boolean;
  vault: PrivateVault;
  profile: AthleteProfile | undefined;
  workouts: Workout[];
  joined: JoinedChallenge[];
  achievements: VerifiedAchievement[];
  stats: {
    total: number;
    thisWeek: number;
    streak: number;
    longest: number;
    bestLift: number;
    minutes: number;
  };
  saveProfile: (profile: AthleteProfile) => void;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (workout: Workout) => void;
  removeWorkout: (id: string) => void;
  joinChallenge: (challenge: Challenge, txHash?: string) => void;
  leaveChallenge: (challengeId: string) => void;
  recordAchievement: (achievement: VerifiedAchievement) => void;
  progressFor: (challenge: Challenge) => {
    joined: JoinedChallenge | undefined;
    verified: VerifiedAchievement | undefined;
    value: number;
    target: number;
    percent: number;
  };
  resetVault: () => void;
};

const GymProofContext = createContext<GymProofContextValue | undefined>(undefined);

const emptyVault: PrivateVault = {
  secretKeyHex: "",
  workouts: [],
  joined: [],
  achievements: [],
};

export function GymProofProvider({ children }: { children: ReactNode }) {
  const [vault, setVault] = useState<PrivateVault>(emptyVault);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setVault(loadVault());
    setReady(true);
  }, []);

  const commit = useCallback((next: PrivateVault) => {
    setVault(next);
    saveVault(next);
  }, []);

  const value = useMemo<GymProofContextValue>(() => {
    const done = completedWorkouts(vault.workouts);
    const weekAgo = Date.now() - 7 * 86_400_000;

    const progressFor = (challenge: Challenge) => {
      const joined = vault.joined.find((entry) => entry.challengeId === challenge.id);
      const verified = vault.achievements.find((a) => a.challengeId === challenge.id);
      const start = joined?.start ?? Date.now() - challenge.windowDays * 86_400_000;
      const end = joined?.end ?? Date.now();

      if (challenge.kind === "STRENGTH") {
        const value = bestLiftKg(vault.workouts);
        const target = challenge.requiredStrengthKg;
        return {
          joined,
          verified,
          value,
          target,
          percent: target ? Math.min(100, Math.round((value / target) * 100)) : 0,
        };
      }
      if (challenge.kind === "STREAK") {
        const value = longestStreak(vault.workouts);
        const target = challenge.requiredStreak;
        return {
          joined,
          verified,
          value,
          target,
          percent: target ? Math.min(100, Math.round((value / target) * 100)) : 0,
        };
      }
      const value = workoutsInWindow(vault.workouts, start, end);
      const target = challenge.requiredWorkouts;
      return {
        joined,
        verified,
        value,
        target,
        percent: target ? Math.min(100, Math.round((value / target) * 100)) : 0,
      };
    };

    return {
      ready,
      vault,
      profile: vault.profile,
      workouts: [...vault.workouts].sort((a, b) => b.date - a.date),
      joined: vault.joined,
      achievements: vault.achievements,
      stats: {
        total: done.length,
        thisWeek: done.filter((w) => w.date >= weekAgo).length,
        streak: currentStreak(vault.workouts),
        longest: longestStreak(vault.workouts),
        bestLift: bestLiftKg(vault.workouts),
        minutes: done.reduce((sum, w) => sum + w.durationMinutes, 0),
      },
      saveProfile: (profile) => commit({ ...vault, profile }),
      addWorkout: (workout) => commit({ ...vault, workouts: [workout, ...vault.workouts] }),
      updateWorkout: (workout) =>
        commit({
          ...vault,
          workouts: vault.workouts.map((w) => (w.id === workout.id ? workout : w)),
        }),
      removeWorkout: (id) =>
        commit({ ...vault, workouts: vault.workouts.filter((w) => w.id !== id) }),
      joinChallenge: (challenge, txHash) => {
        if (vault.joined.some((entry) => entry.challengeId === challenge.id)) return;
        const now = Date.now();
        commit({
          ...vault,
          joined: [
            ...vault.joined,
            {
              challengeId: challenge.id,
              joinedAt: now,
              start: now,
              end: now + challenge.windowDays * 86_400_000,
              ...(txHash ? { joinTxHash: txHash } : {}),
            },
          ],
        });
      },
      leaveChallenge: (challengeId) =>
        commit({
          ...vault,
          joined: vault.joined.filter((entry) => entry.challengeId !== challengeId),
        }),
      recordAchievement: (achievement) =>
        commit({
          ...vault,
          achievements: [
            ...vault.achievements.filter((a) => a.challengeId !== achievement.challengeId),
            achievement,
          ],
        }),
      progressFor,
      resetVault: () => {
        clearVault();
        setVault(loadVault());
      },
    };
  }, [commit, ready, vault]);

  return <GymProofContext.Provider value={value}>{children}</GymProofContext.Provider>;
}

export const useGymProof = (): GymProofContextValue => {
  const context = useContext(GymProofContext);
  if (!context) throw new Error("useGymProof must be used inside <GymProofProvider>");
  return context;
};

export const allChallenges = CHALLENGES;
