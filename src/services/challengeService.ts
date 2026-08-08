import type { Challenge, LibraryExercise } from "@/types/gymproof";

/**
 * Challenge catalogue.
 *
 * The `id` of each challenge is the 32-byte identifier used on-chain
 * (`createChallenge` / `joinChallenge` / `proveChallengeCompletion`). Keeping
 * them fixed means the client and the deployed contract agree without any
 * extra lookup service.
 */
export const CHALLENGES: Challenge[] = [
  {
    id: "6779",
    slug: "7-day-warrior",
    title: "7-Day Warrior",
    description: "Seven sessions, seven days. No skipped days, no excuses.",
    requirement: "Complete 7 workouts in 7 consecutive days",
    kind: "STREAK",
    requiredWorkouts: 7,
    requiredStreak: 7,
    requiredStrengthKg: 0,
    windowDays: 7,
    reward: "7-Day Warrior badge",
  },
  {
    id: "3164",
    slug: "30-day-consistency",
    title: "30-Day Consistency",
    description: "The flagship GymProof challenge — consistency over intensity.",
    requirement: "Complete at least 20 workouts within 30 days",
    kind: "COUNT",
    requiredWorkouts: 20,
    requiredStreak: 0,
    requiredStrengthKg: 0,
    windowDays: 30,
    reward: "Consistency Master badge",
  },
  {
    id: "0064",
    slug: "100-workout-club",
    title: "100 Workout Club",
    description: "A long-haul milestone for athletes who keep showing up.",
    requirement: "Complete 100 workouts",
    kind: "COUNT",
    requiredWorkouts: 100,
    requiredStreak: 0,
    requiredStrengthKg: 0,
    windowDays: 730,
    reward: "100 Workout Club badge",
  },
  {
    id: "0140",
    slug: "strength-challenge",
    title: "Strength Challenge",
    description: "Prove a strength milestone without publishing your numbers.",
    requirement: "Record a single lift of at least 140 kg",
    kind: "STRENGTH",
    requiredWorkouts: 0,
    requiredStreak: 0,
    requiredStrengthKg: 140,
    windowDays: 365,
    reward: "Strength Beast badge",
  },
  {
    id: "5a90",
    slug: "90-day-discipline",
    title: "90-Day Discipline",
    description: "Three months of maintained training frequency.",
    requirement: "Complete at least 54 workouts within 90 days",
    kind: "COUNT",
    requiredWorkouts: 54,
    requiredStreak: 0,
    requiredStrengthKg: 0,
    windowDays: 90,
    reward: "Elite Discipline badge",
  },
];

/** Expands a short catalogue id into the 64-char hex the contract expects. */
export const toContractChallengeId = (id: string): string => id.padEnd(64, "0");

export const findChallenge = (id: string): Challenge | undefined =>
  CHALLENGES.find((challenge) => challenge.id === id || challenge.slug === id);

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  { name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell", difficulty: "Intermediate" },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbell", difficulty: "Intermediate" },
  { name: "Cable Fly", muscleGroup: "Chest", equipment: "Cable", difficulty: "Beginner" },
  { name: "Push-Up", muscleGroup: "Chest", equipment: "Bodyweight", difficulty: "Beginner" },
  { name: "Deadlift", muscleGroup: "Back", equipment: "Barbell", difficulty: "Advanced" },
  { name: "Pull-Up", muscleGroup: "Back", equipment: "Bodyweight", difficulty: "Intermediate" },
  { name: "Barbell Row", muscleGroup: "Back", equipment: "Barbell", difficulty: "Intermediate" },
  { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable", difficulty: "Beginner" },
  { name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell", difficulty: "Intermediate" },
  { name: "Lateral Raise", muscleGroup: "Shoulders", equipment: "Dumbbell", difficulty: "Beginner" },
  { name: "Face Pull", muscleGroup: "Shoulders", equipment: "Cable", difficulty: "Beginner" },
  { name: "Barbell Curl", muscleGroup: "Biceps", equipment: "Barbell", difficulty: "Beginner" },
  { name: "Hammer Curl", muscleGroup: "Biceps", equipment: "Dumbbell", difficulty: "Beginner" },
  { name: "Preacher Curl", muscleGroup: "Biceps", equipment: "Machine", difficulty: "Intermediate" },
  { name: "Close-Grip Bench Press", muscleGroup: "Triceps", equipment: "Barbell", difficulty: "Intermediate" },
  { name: "Triceps Pushdown", muscleGroup: "Triceps", equipment: "Cable", difficulty: "Beginner" },
  { name: "Skull Crusher", muscleGroup: "Triceps", equipment: "EZ Bar", difficulty: "Intermediate" },
  { name: "Back Squat", muscleGroup: "Legs", equipment: "Barbell", difficulty: "Advanced" },
  { name: "Front Squat", muscleGroup: "Legs", equipment: "Barbell", difficulty: "Advanced" },
  { name: "Romanian Deadlift", muscleGroup: "Legs", equipment: "Barbell", difficulty: "Intermediate" },
  { name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", difficulty: "Beginner" },
  { name: "Walking Lunge", muscleGroup: "Legs", equipment: "Dumbbell", difficulty: "Intermediate" },
  { name: "Plank", muscleGroup: "Core", equipment: "Bodyweight", difficulty: "Beginner" },
  { name: "Hanging Leg Raise", muscleGroup: "Core", equipment: "Bodyweight", difficulty: "Intermediate" },
  { name: "Cable Crunch", muscleGroup: "Core", equipment: "Cable", difficulty: "Beginner" },
  { name: "Clean & Press", muscleGroup: "Full Body", equipment: "Barbell", difficulty: "Advanced" },
  { name: "Kettlebell Swing", muscleGroup: "Full Body", equipment: "Kettlebell", difficulty: "Intermediate" },
  { name: "Burpee", muscleGroup: "Full Body", equipment: "Bodyweight", difficulty: "Beginner" },
];
