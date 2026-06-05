# Authentication

## Provider

**This app uses Clerk for all authentication. Do not use any other auth library.**

- Do not use NextAuth, Auth.js, Supabase Auth, or any other authentication solution.
- Do not implement custom JWT handling or session management.
- All auth state, user sessions, and identity are managed exclusively by Clerk.

## Getting the Current User

Always use Clerk's server-side helpers to obtain the authenticated user. Never trust user identity from the request (query params, body, headers).

```ts
import { auth, currentUser } from "@clerk/nextjs/server";

// Get userId only (preferred for data queries)
const { userId } = await auth();

// Get full user object (use only when you need profile data)
const user = await currentUser();
```

Use `auth()` in Server Components, Server Actions, and `/data` helpers. Use `currentUser()` only when you need profile fields (name, email, image).

## Protecting Pages

Use Clerk middleware to protect routes. Do not implement manual redirect logic in individual pages.

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/workout(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});
```

- All authenticated routes must be listed in the protected route matcher.
- Do not use `redirect()` inside a page to enforce auth — that belongs in middleware.

## UI Components

Use Clerk's pre-built components for all sign-in, sign-up, and user profile UI.

```tsx
import { SignIn, SignUp, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

// Show content conditionally based on auth state
<SignedIn>
  <UserButton />
</SignedIn>
<SignedOut>
  <SignIn />
</SignedOut>
```

- Do not build custom sign-in or sign-up forms.
- Do not build a custom user avatar or account menu — use `<UserButton />`.

## Data Isolation

The `userId` from `auth()` is the single source of truth for ownership. See `data-fetching.md` for the full data isolation rules.

```ts
import { auth } from "@clerk/nextjs/server";

export async function getWorkoutsForUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

- Never pass `userId` as a parameter from a client component or route param.
- Always call `auth()` inside the `/data` helper itself, or pass the `userId` obtained server-side from the calling Server Component.
- If `userId` is `null`, the user is not signed in — throw or redirect accordingly.
