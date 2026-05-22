# Data Fetching

## Rules

### Server Components Only

All data fetching MUST be done exclusively via **React Server Components**.

- **NEVER** fetch data in Client Components (`"use client"`)
- **NEVER** fetch data in Route Handlers (`src/app/api/`)
- **NEVER** use `useEffect` + `fetch` patterns
- **NEVER** use SWR, React Query, or similar client-side fetching libraries

Data flows one way: database → server component → props/slots → client components (for interactivity only).

### /data Directory

All database queries MUST be encapsulated in helper functions inside the `/data` directory.

- **NEVER** write raw SQL
- **ALWAYS** use Drizzle ORM for all queries
- Helper functions are the only place database access is permitted

```
src/
  data/
    workouts.ts      # e.g. getWorkouts(), getWorkoutById()
    exercises.ts     # e.g. getExercises()
```

Example helper:

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

### Data Isolation — Critical Security Requirement

Logged-in users must ONLY be able to access their own data. This is a hard security requirement.

- **ALWAYS** filter queries by the authenticated user's ID
- **NEVER** expose a query that returns data for all users or accepts an arbitrary userId from user input
- **ALWAYS** obtain the userId from the server-side session (e.g. `auth()` / `getServerSession()`), never from query params, route params, or request body

```ts
// CORRECT — userId comes from the verified session
export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

// WRONG — never trust userId from the request
export async function getWorkout(id: string) {
  return db.select().from(workouts).where(eq(workouts.id, id)); // missing ownership check
}
```

Every `/data` helper that returns user-owned records must accept a `userId` parameter sourced from the session and apply it as a WHERE condition.
