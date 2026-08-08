import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell, Lock, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { EXERCISE_LIBRARY } from "@/services/challengeService";
import type { MuscleGroup, Workout, WorkoutExercise } from "@/types/gymproof";

export const Route = createFileRoute("/workouts")({
  head: () => ({
    meta: [
      { title: "Workout Log — GymProof" },
      {
        name: "description",
        content:
          "Log exercises, sets, reps and weights into a private on-device vault used as witness data for zero-knowledge proofs.",
      },
      { property: "og:title", content: "Workout Log — GymProof" },
      { property: "og:description", content: "A training log that never leaves your device." },
    ],
  }),
  component: Workouts,
});

const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Core",
  "Full Body",
];

const uid = () => crypto.randomUUID();

function Workouts() {
  const { workouts, addWorkout, removeWorkout } = useGymProof();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      workouts.filter((workout) =>
        `${workout.name} ${workout.muscleGroups.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, workouts],
  );

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Workout log</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="size-4 text-accent" /> Stored locally. Used only as ZK witness data.
            </p>
          </div>
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New workout
          </Button>
        </div>

        <div className="relative mt-8 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search workouts"
            className="pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="mt-6 border-dashed p-12 text-center">
            <Dumbbell className="mx-auto size-8 text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl font-semibold">No workouts yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Log your first session to start building provable consistency.
            </p>
            <Button className="mt-6" onClick={() => setOpen(true)}>
              Log a workout
            </Button>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filtered.map((workout) => (
              <Card key={workout.id} className="bg-panel border-border/70 p-6 shadow-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">{workout.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {new Date(workout.date).toLocaleDateString()} · {workout.durationMinutes} min ·{" "}
                      {workout.exercises.length} exercises
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      removeWorkout(workout.id);
                      toast.success("Workout removed from your vault");
                    }}
                    aria-label="Delete workout"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {workout.muscleGroups.map((group) => (
                    <Badge key={group} variant="secondary">
                      {group}
                    </Badge>
                  ))}
                </div>

                <ul className="mt-4 space-y-2 text-sm">
                  {workout.exercises.map((exercise) => (
                    <li key={exercise.id} className="rounded-lg bg-surface px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span>{exercise.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {exercise.sets.length} × sets
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {exercise.sets.map((set) => `${set.weightKg}kg×${set.reps}`).join("  ·  ")}
                      </p>
                    </li>
                  ))}
                </ul>

                {workout.notes ? (
                  <p className="mt-3 text-xs text-muted-foreground">{workout.notes}</p>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </main>

      <WorkoutDialog
        open={open}
        onOpenChange={setOpen}
        onSave={(workout) => {
          addWorkout(workout);
          toast.success("Workout saved to your private vault");
        }}
      />
    </div>
  );
}

function WorkoutDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workout: Workout) => void;
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [picker, setPicker] = useState("");

  const reset = () => {
    setName("");
    setDate(new Date().toISOString().slice(0, 10));
    setDuration("60");
    setNotes("");
    setExercises([]);
    setPicker("");
  };

  const addExercise = (exerciseName: string) => {
    const library = EXERCISE_LIBRARY.find((item) => item.name === exerciseName);
    if (!library) return;
    setExercises((current) => [
      ...current,
      {
        id: uid(),
        name: library.name,
        muscleGroup: library.muscleGroup,
        notes: "",
        sets: [{ id: uid(), weightKg: 0, reps: 8, restSeconds: 90, notes: "" }],
      },
    ]);
    setPicker("");
  };

  const submit = () => {
    if (!name.trim() || exercises.length === 0) {
      toast.error("Add a name and at least one exercise");
      return;
    }
    onSave({
      id: uid(),
      name: name.trim(),
      date: new Date(date).getTime(),
      durationMinutes: Number(duration) || 0,
      muscleGroups: Array.from(new Set(exercises.map((e) => e.muscleGroup))),
      notes: notes.trim(),
      exercises,
      completed: true,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log a workout</DialogTitle>
          <DialogDescription>
            Saved to your browser vault only. Nothing here is transmitted or published.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <Label htmlFor="workout-name">Session name</Label>
            <Input
              id="workout-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Push day A"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="workout-date">Date</Label>
            <Input
              id="workout-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="workout-duration">Duration (min)</Label>
            <Input
              id="workout-duration"
              type="number"
              min={0}
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Add exercise</Label>
            <Select value={picker} onValueChange={addExercise}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Exercise library" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {MUSCLE_GROUPS.map((group) => (
                  <div key={group}>
                    <p className="px-2 py-1.5 text-xs uppercase tracking-widest text-muted-foreground">
                      {group}
                    </p>
                    {EXERCISE_LIBRARY.filter((item) => item.muscleGroup === group).map((item) => (
                      <SelectItem key={item.name} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">{exercise.muscleGroup}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove exercise"
                  onClick={() =>
                    setExercises((current) => current.filter((item) => item.id !== exercise.id))
                  }
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {exercise.sets.map((set, index) => (
                  <div key={set.id} className="flex items-center gap-2">
                    <span className="w-10 font-mono text-xs text-muted-foreground">#{index + 1}</span>
                    <Input
                      type="number"
                      min={0}
                      value={set.weightKg}
                      onChange={(event) =>
                        setExercises((current) =>
                          current.map((item) =>
                            item.id === exercise.id
                              ? {
                                  ...item,
                                  sets: item.sets.map((s) =>
                                    s.id === set.id
                                      ? { ...s, weightKg: Number(event.target.value) }
                                      : s,
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                      className="h-9"
                      aria-label="Weight in kg"
                    />
                    <span className="text-xs text-muted-foreground">kg</span>
                    <Input
                      type="number"
                      min={0}
                      value={set.reps}
                      onChange={(event) =>
                        setExercises((current) =>
                          current.map((item) =>
                            item.id === exercise.id
                              ? {
                                  ...item,
                                  sets: item.sets.map((s) =>
                                    s.id === set.id ? { ...s, reps: Number(event.target.value) } : s,
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                      className="h-9"
                      aria-label="Reps"
                    />
                    <span className="text-xs text-muted-foreground">reps</span>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="mt-2 gap-1"
                onClick={() =>
                  setExercises((current) =>
                    current.map((item) =>
                      item.id === exercise.id
                        ? {
                            ...item,
                            sets: [
                              ...item.sets,
                              { id: uid(), weightKg: 0, reps: 8, restSeconds: 90, notes: "" },
                            ],
                          }
                        : item,
                    ),
                  )
                }
              >
                <Plus className="size-3.5" /> Add set
              </Button>
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor="workout-notes">Notes</Label>
          <Textarea
            id="workout-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="How did the session feel?"
            className="mt-1.5"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save workout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
