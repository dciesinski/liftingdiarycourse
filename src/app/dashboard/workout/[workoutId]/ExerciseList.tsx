"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addExerciseToWorkoutAction,
  removeExerciseFromWorkoutAction,
  addSetAction,
  removeSetAction,
} from "./exerciseActions";

type Exercise = { id: string; name: string };

type SetRow = {
  setId: string;
  setNumber: number;
  reps: number;
  weight: string;
  weightUnit: "kg" | "lbs";
};

type WorkoutExercise = {
  workoutExerciseId: string;
  order: number;
  exerciseId: string;
  exerciseName: string;
  sets: SetRow[];
};

type Props = {
  workoutId: string;
  workoutExercises: WorkoutExercise[];
  allExercises: Exercise[];
};

export default function ExerciseList({
  workoutId,
  workoutExercises,
  allExercises,
}: Props) {
  const router = useRouter();
  const [comboOpen, setComboOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleAddExercise(exerciseId: string) {
    setAdding(true);
    setComboOpen(false);
    try {
      await addExerciseToWorkoutAction({ workoutId, exerciseId });
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveExercise(workoutExerciseId: string) {
    await removeExerciseFromWorkoutAction({ workoutExerciseId, workoutId });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Exercises</h2>
        <Popover open={comboOpen} onOpenChange={setComboOpen}>
          <PopoverTrigger
            disabled={adding}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
          >
            + Add Exercise
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search exercises..." />
              <CommandList>
                <CommandEmpty>No exercises found.</CommandEmpty>
                <CommandGroup>
                  {allExercises.map((ex) => (
                    <CommandItem
                      key={ex.id}
                      value={ex.name}
                      onSelect={() => handleAddExercise(ex.id)}
                    >
                      {ex.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {workoutExercises.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No exercises yet. Add one above.
        </p>
      )}

      {workoutExercises.map((we) => (
        <ExerciseCard
          key={we.workoutExerciseId}
          workoutId={workoutId}
          workoutExercise={we}
          onRemoveExercise={handleRemoveExercise}
        />
      ))}
    </div>
  );
}

function ExerciseCard({
  workoutId,
  workoutExercise,
  onRemoveExercise,
}: {
  workoutId: string;
  workoutExercise: WorkoutExercise;
  onRemoveExercise: (id: string) => void;
}) {
  const router = useRouter();
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [pending, setPending] = useState(false);

  async function handleAddSet(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await addSetAction({
        workoutExerciseId: workoutExercise.workoutExerciseId,
        workoutId,
        reps: parseInt(reps, 10),
        weight: parseFloat(weight),
        weightUnit,
      });
      setReps("");
      setWeight("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleRemoveSet(setId: string) {
    await removeSetAction({ setId, workoutId });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">{workoutExercise.exerciseName}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onRemoveExercise(workoutExercise.workoutExerciseId)}
        >
          Remove
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {workoutExercise.sets.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Set</TableHead>
                <TableHead>Reps</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {workoutExercise.sets.map((s) => (
                <TableRow key={s.setId}>
                  <TableCell>{s.setNumber}</TableCell>
                  <TableCell>{s.reps}</TableCell>
                  <TableCell>
                    {s.weight} {s.weightUnit}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive h-7 px-2"
                      onClick={() => handleRemoveSet(s.setId)}
                    >
                      ×
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <form onSubmit={handleAddSet} className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Reps</label>
            <Input
              className="w-20"
              type="number"
              min={1}
              placeholder="10"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Weight</label>
            <Input
              className="w-24"
              type="number"
              min={0}
              step={0.5}
              placeholder="60"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Unit</label>
            <div className="flex border rounded-md overflow-hidden">
              <button
                type="button"
                className={`px-3 py-2 text-sm ${weightUnit === "kg" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                onClick={() => setWeightUnit("kg")}
              >
                kg
              </button>
              <button
                type="button"
                className={`px-3 py-2 text-sm ${weightUnit === "lbs" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                onClick={() => setWeightUnit("lbs")}
              >
                lbs
              </button>
            </div>
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "..." : "Log Set"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
