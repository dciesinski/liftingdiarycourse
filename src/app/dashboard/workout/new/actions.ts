"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
});

export async function createWorkoutAction(params: {
  name: string;
  date: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const parsed = createWorkoutSchema.parse(params);

  // Parse as local noon to avoid UTC midnight shifting the date in non-UTC timezones
  const startedAt = new Date(`${parsed.date}T12:00:00`);

  await createWorkout(userId, parsed.name, startedAt);

  return { date: parsed.date };
}
