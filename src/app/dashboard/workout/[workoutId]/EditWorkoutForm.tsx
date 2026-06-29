"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkoutAction } from "./actions";

type Props = {
  workout: {
    id: string;
    name: string | null;
    startedAt: Date;
  };
};

export default function EditWorkoutForm({ workout }: Props) {
  const router = useRouter();
  const [name, setName] = useState(workout.name ?? "");
  const [date, setDate] = useState(format(workout.startedAt, "yyyy-MM-dd"));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { date: redirectDate } = await updateWorkoutAction({
        id: workout.id,
        name,
        date,
      });
      router.push(`/dashboard?date=${redirectDate}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        setPending(false);
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Workout</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              placeholder="e.g. Push Day"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </form>
    </div>
  );
}
