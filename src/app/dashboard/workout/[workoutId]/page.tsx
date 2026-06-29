import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById } from "@/data/workouts";
import { getWorkoutExercises, getAllExercises } from "@/data/exercises";
import EditWorkoutForm from "./EditWorkoutForm";
import ExerciseList from "./ExerciseList";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const { userId } = await auth();
  if (!userId) return notFound();

  const [workout, workoutExercises, allExercises] = await Promise.all([
    getWorkoutById(workoutId, userId),
    getWorkoutExercises(workoutId, userId),
    getAllExercises(),
  ]);

  if (!workout) return notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-md mx-auto flex flex-col gap-8">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          ← Back to Dashboard
        </Link>
        <EditWorkoutForm workout={workout} />
        <ExerciseList
          workoutId={workoutId}
          workoutExercises={workoutExercises}
          allExercises={allExercises}
        />
      </div>
    </div>
  );
}
