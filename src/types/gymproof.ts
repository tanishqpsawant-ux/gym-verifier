export type PrivacyMode = "PRIVATE" | "PUBLIC" | "ANONYMOUS";

export type AthleteProfile = {
  username: string;
  displayName: string;
  avatar: string;
  goal: string;
  experience: "beginner" | "intermediate" | "advanced" | "elite";
  style: string;
  privacy: PrivacyMode;
  createdAt: number;
};

export type ExerciseSet = {
  id: string;
  weightKg: number;
  reps: number;
  restSeconds: number;
  notes: string;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: ExerciseSet[];
  notes: string;
};

export type Workout = {
  id: string;
  name: string;
  /** epoch millis */
  date: number;
  durationMinutes: number;
  muscleGroups: MuscleGroup[];
  notes: string;
  exercises: WorkoutExercise[];
  completed: boolean;
};

export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Legs"
  | "Core"
  | "Full Body";

export type LibraryExercise = {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

export type ChallengeKind = "COUNT" | "STREAK" | "STRENGTH";

export type Challenge = {
  /** 32-byte hex identifier used as the on-chain challenge id. */
  id: string;
  slug: string;
  title: string;
  description: string;
  requirement: string;
  kind: ChallengeKind;
  requiredWorkouts: number;
  requiredStreak: number;
  requiredStrengthKg: number;
  windowDays: number;
  reward: string;
};

export type JoinedChallenge = {
  challengeId: string;
  joinedAt: number;
  /** window start/end in epoch millis */
  start: number;
  end: number;
  /** tx hash of the on-chain join, when it has been submitted */
  joinTxHash?: string;
};

/** A verified achievement. Only ever created from a confirmed on-chain proof. */
export type VerifiedAchievement = {
  achievementId: string;
  challengeId: string;
  txHash: string;
  contractAddress: string;
  network: string;
  verifiedAt: number;
};

export type PrivateVault = {
  /** Local ZK identity secret (hex). Not a wallet key; never transmitted. */
  secretKeyHex: string;
  profile?: AthleteProfile;
  workouts: Workout[];
  joined: JoinedChallenge[];
  achievements: VerifiedAchievement[];
};

export type ProofStage =
  | "idle"
  | "preparing"
  | "proving"
  | "awaiting-wallet"
  | "submitting"
  | "verifying"
  | "verified"
  | "failed";
