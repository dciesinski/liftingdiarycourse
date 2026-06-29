import { db } from "@/db";
import { exercises, workoutExercises, workouts, sets } from "@/db/schema";
import { eq, and, asc, count } from "drizzle-orm";

export async function getAllExercises() {
  return db.select().from(exercises).orderBy(asc(exercises.name));
}

export async function getWorkoutExercises(workoutId: string, userId: string) {
  const rows = await db
    .select({
      workoutExerciseId: workoutExercises.id,
      order: workoutExercises.order,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
      weightUnit: sets.weightUnit,
    })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workoutExercises.workoutId, workoutId),
        eq(workouts.userId, userId)
      )
    )
    .orderBy(asc(workoutExercises.order), asc(sets.setNumber));

  // Group flat rows into WorkoutExercise objects with nested sets
  const map = new Map<
    string,
    {
      workoutExerciseId: string;
      order: number;
      exerciseId: string;
      exerciseName: string;
      sets: {
        setId: string;
        setNumber: number;
        reps: number;
        weight: string;
        weightUnit: "kg" | "lbs";
      }[];
    }
  >();

  for (const row of rows) {
    if (!map.has(row.workoutExerciseId)) {
      map.set(row.workoutExerciseId, {
        workoutExerciseId: row.workoutExerciseId,
        order: row.order,
        exerciseId: row.exerciseId,
        exerciseName: row.exerciseName,
        sets: [],
      });
    }
    if (row.setId) {
      map.get(row.workoutExerciseId)!.sets.push({
        setId: row.setId,
        setNumber: row.setNumber!,
        reps: row.reps!,
        weight: row.weight!,
        weightUnit: row.weightUnit!,
      });
    }
  }

  return Array.from(map.values());
}

export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string
) {
  const [{ nextOrder }] = await db
    .select({ nextOrder: count(workoutExercises.id) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  return db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order: Number(nextOrder) + 1 })
    .returning();
}

export async function removeExerciseFromWorkout(workoutExerciseId: string) {
  return db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId));
}

export async function addSet(
  workoutExerciseId: string,
  reps: number,
  weight: string,
  weightUnit: "kg" | "lbs"
) {
  const [{ nextSet }] = await db
    .select({ nextSet: count(sets.id) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  return db
    .insert(sets)
    .values({
      workoutExerciseId,
      setNumber: Number(nextSet) + 1,
      reps,
      weight,
      weightUnit,
    })
    .returning();
}

export async function removeSet(setId: string) {
  return db.delete(sets).where(eq(sets.id, setId));
}
