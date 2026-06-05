import { auth } from "@clerk/nextjs/server";
import { format, parseISO } from "date-fns";
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { DatePicker } from "./DatePicker";
import { getWorkoutsForUserOnDate } from "@/data/workouts";

async function WorkoutList({ userId, date }: { userId: string; date: Date }) {
  const workouts = await getWorkoutsForUserOnDate(userId, date);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">
        Workouts for {format(date, "do MMM yyyy")}
      </h2>

      {workouts.length === 0 ? (
        <p className="text-sm text-zinc-500">No workouts logged for this date.</p>
      ) : (
        workouts.map((workout) => (
          <Card key={workout.id}>
            <CardHeader className="pb-1">
              <CardTitle className="text-base">{workout.name ?? "Untitled Workout"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">
                {workout.exerciseCount} {workout.exerciseCount === 1 ? "exercise" : "exercises"}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  const { date: dateParam } = await searchParams;

  const date = dateParam ? parseISO(dateParam) : new Date();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Lifting Diary</h1>
          <Link
            href="/dashboard/workout/new"
            className={buttonVariants()}
          >
            New Workout
          </Link>
        </div>

        <DatePicker selected={date} />

        <Suspense fallback={<p className="text-sm text-zinc-500">Loading workouts...</p>}>
          {userId && <WorkoutList userId={userId} date={date} />}
        </Suspense>
      </div>
    </div>
  );
}
