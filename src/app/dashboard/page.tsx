"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockWorkouts = [
  { id: 1, name: "Morning Push", exercises: 5, duration: "45 min" },
  { id: 2, name: "Leg Day", exercises: 6, duration: "60 min" },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              className={buttonVariants({ variant: "outline" }) + " w-[220px] justify-start gap-2 font-normal"}
            >
              <CalendarIcon className="h-4 w-4 text-zinc-500" />
              {format(date, "do MMM yyyy")}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">
            Workouts for {format(date, "do MMM yyyy")}
          </h2>

          {mockWorkouts.length === 0 ? (
            <p className="text-sm text-zinc-500">No workouts logged for this date.</p>
          ) : (
            mockWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-1">
                  <CardTitle className="text-base">{workout.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500">
                    {workout.exercises} exercises &middot; {workout.duration}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
