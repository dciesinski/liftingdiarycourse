# Data Mutations

## Rules

### Server Actions Only

All data mutations MUST be done exclusively via **Server Actions**.

- **NEVER** mutate data in Route Handlers (`src/app/api/`)
- **NEVER** mutate data directly from Client Components
- **NEVER** use `fetch` + `POST` patterns for mutations

### Colocated actions.ts Files

Server Actions must be defined in colocated `actions.ts` files, placed next to the route or component they belong to.

```
src/app/
  workouts/
    page.tsx
    actions.ts      # server actions for this route
    new/
      page.tsx
      actions.ts    # server actions for this sub-route
```

Every `actions.ts` file must begin with the `"use server"` directive:

```ts
"use server";
```

### /data Directory

All database calls MUST be encapsulated in helper functions inside the `/data` directory. Server Actions must never call the database directly — they call `/data` helpers, which wrap Drizzle ORM.

```
src/
  data/
    workouts.ts      # e.g. createWorkout(), updateWorkout(), deleteWorkout()
    exercises.ts     # e.g. createExercise()
```

Example helper:

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date }).returning();
}
```

Example server action calling a `/data` helper:

```ts
// src/app/workouts/new/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

export async function createWorkoutAction(params: {
  name: string;
  date: Date;
}) {
  const { userId } = await auth();

  const parsed = createWorkoutSchema.parse(params);

  return createWorkout(userId, parsed.name, parsed.date);
}
```

### Typed Parameters — No FormData

Server Action parameters MUST be typed TypeScript types or interfaces.

- **NEVER** use `FormData` as a parameter type
- **ALWAYS** define an explicit TypeScript type for the params object

```ts
// CORRECT — typed params
export async function updateWorkoutAction(params: {
  id: string;
  name: string;
}) { ... }

// WRONG — FormData is not permitted
export async function updateWorkoutAction(formData: FormData) { ... }
```

### Zod Validation

Every Server Action MUST validate its arguments with Zod before using them.

- Define a Zod schema at the top of the action (or in a shared `schemas.ts` file in the same directory)
- Call `.parse()` or `.safeParse()` on the incoming params before any database access
- **NEVER** pass raw, unvalidated params to a `/data` helper

```ts
const updateWorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
});

export async function updateWorkoutAction(params: { id: string; name: string }) {
  const parsed = updateWorkoutSchema.parse(params);
  // use parsed.id and parsed.name going forward
}
```

### Data Isolation — Critical Security Requirement

The same ownership rules that apply to data fetching apply to mutations. Users must ONLY be able to mutate their own data.

- **ALWAYS** obtain `userId` from the server-side session, never from action params
- **ALWAYS** verify ownership before updating or deleting a record (re-fetch by both `id` and `userId`)
- **NEVER** trust an `id` from the client without an ownership check

```ts
// CORRECT — ownership verified via session userId
export async function deleteWorkoutAction(params: { id: string }) {
  const { userId } = await auth();
  const parsed = deleteWorkoutSchema.parse(params);
  return deleteWorkout(parsed.id, userId); // /data helper filters by both id and userId
}

// WRONG — no ownership check
export async function deleteWorkoutAction(params: { id: string }) {
  return db.delete(workouts).where(eq(workouts.id, params.id));
}
```

### No Redirects in Server Actions

**NEVER** call `redirect()` inside a Server Action. Redirects must be handled client-side after the action resolves.

- Server Actions should return data (e.g. the created/updated record, or a typed result object) so the caller can decide what to do next
- The calling Client Component performs the redirect using `router.push()` from `next/navigation`

```ts
// CORRECT — action returns data, client handles redirect
// actions.ts
export async function createWorkoutAction(params: { name: string; date: string }) {
  // ...
  await createWorkout(userId, name, startedAt);
  return { date: params.date };
}

// page.tsx (Client Component)
const { date } = await createWorkoutAction(params);
router.push(`/dashboard?date=${date}`);

// WRONG — redirect inside the action
export async function createWorkoutAction(params: { name: string; date: string }) {
  // ...
  await createWorkout(userId, name, startedAt);
  redirect(`/dashboard?date=${params.date}`);
}
```
