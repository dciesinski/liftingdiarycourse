import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById } from "@/data/workouts";
import EditWorkoutForm from "./EditWorkoutForm";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const { userId } = await auth();
  if (!userId) return notFound();

  const workout = await getWorkoutById(workoutId, userId);
  if (!workout) return notFound();

  return <EditWorkoutForm workout={workout} />;
}
