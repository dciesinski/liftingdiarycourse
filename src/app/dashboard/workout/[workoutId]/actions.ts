"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
});

export async function updateWorkoutAction(params: {
  id: string;
  name: string;
  date: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const parsed = updateWorkoutSchema.parse(params);

  const startedAt = new Date(`${parsed.date}T12:00:00`);

  await updateWorkout(parsed.id, userId, parsed.name, startedAt);

  return { date: parsed.date };
}
