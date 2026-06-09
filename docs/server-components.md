# Server Components

## Rules

### Async Server Components

All Server Components that access route data (`params`, `searchParams`) MUST be declared `async`.

### Params and SearchParams Are Promises — Always Await Them

In Next.js 15, `params` and `searchParams` are **Promises**. You MUST `await` them before accessing any properties.

- **NEVER** destructure `params` or `searchParams` directly from props
- **ALWAYS** type them as `Promise<...>` in the props type
- **ALWAYS** `await` them at the top of the component

```ts
// CORRECT — params is typed as a Promise and awaited
type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  // ...
}

// WRONG — params is not a Promise in Next.js 15, this will break
type Props = {
  params: { workoutId: string };
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = params; // runtime error
  // ...
}
```

The same rule applies to `searchParams`:

```ts
// CORRECT
type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { date } = await searchParams;
  // ...
}
```

### Data Fetching in Server Components

All data fetching must happen in Server Components — never in Client Components. See `/docs/data-fetching.md` for the full rules.

Pass fetched data down to Client Components as props; Client Components handle interactivity only.

```ts
// CORRECT — server component fetches, client component renders form
export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const { userId } = await auth();
  const workout = await getWorkoutById(workoutId, userId);

  return <EditWorkoutForm workout={workout} />;
}
```

### Not Found Handling

Use `notFound()` from `next/navigation` when a resource does not exist or the user does not own it. Do not throw or return a custom error UI.

```ts
import { notFound } from "next/navigation";

const workout = await getWorkoutById(workoutId, userId);
if (!workout) return notFound();
```
