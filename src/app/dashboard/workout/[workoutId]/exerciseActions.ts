"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById } from "@/data/workouts";
import {
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSet,
  removeSet,
} from "@/data/exercises";

const workoutIdSchema = z.string().uuid();
// Non-strict: seeded exercise IDs use non-RFC-4122 formats that fail Zod v4's uuid()
const idSchema = z.string().min(1);

async function verifyWorkoutOwnership(workoutId: string, userId: string) {
  const workout = await getWorkoutById(workoutId, userId);
  if (!workout) throw new Error("Workout not found");
  return workout;
}

export async function addExerciseToWorkoutAction(params: {
  workoutId: string;
  exerciseId: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const workoutId = workoutIdSchema.parse(params.workoutId);
  const exerciseId = idSchema.parse(params.exerciseId);

  await verifyWorkoutOwnership(workoutId, userId);
  await addExerciseToWorkout(workoutId, exerciseId);
}

export async function removeExerciseFromWorkoutAction(params: {
  workoutExerciseId: string;
  workoutId: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const workoutExerciseId = idSchema.parse(params.workoutExerciseId);
  const workoutId = workoutIdSchema.parse(params.workoutId);

  await verifyWorkoutOwnership(workoutId, userId);
  await removeExerciseFromWorkout(workoutExerciseId);
}

const addSetSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  workoutId: z.string().uuid(),
  reps: z.number().int().min(1),
  weight: z.number().min(0),
  weightUnit: z.enum(["kg", "lbs"]),
});

export async function addSetAction(params: {
  workoutExerciseId: string;
  workoutId: string;
  reps: number;
  weight: number;
  weightUnit: "kg" | "lbs";
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const parsed = addSetSchema.parse(params);

  await verifyWorkoutOwnership(parsed.workoutId, userId);
  await addSet(
    parsed.workoutExerciseId,
    parsed.reps,
    String(parsed.weight),
    parsed.weightUnit
  );
}

export async function removeSetAction(params: {
  setId: string;
  workoutId: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const setId = idSchema.parse(params.setId);
  const workoutId = workoutIdSchema.parse(params.workoutId);

  await verifyWorkoutOwnership(workoutId, userId);
  await removeSet(setId);
}
