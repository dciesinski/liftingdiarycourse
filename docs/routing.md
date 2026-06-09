# Routing

## Route Structure

**All app routes live under `/dashboard`.**

- The root `/` route should redirect to `/dashboard` or a public landing/sign-in page.
- Feature pages are nested under `/dashboard` (e.g. `/dashboard/workout/[workoutId]`).
- Do not create top-level routes for app features.

## Protected Routes

**All `/dashboard` routes are protected and require an authenticated user.**

Route protection is enforced exclusively via the Next.js proxy file using Clerk. Do not implement manual auth redirects inside individual page components.

> **Next.js 16 note:** The `middleware.ts` convention is deprecated. Use `proxy.ts` at the project root instead.

```ts
// proxy.ts (project root)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

- `"/dashboard(.*)"` covers `/dashboard` and all sub-routes.
- `auth.protect()` redirects unauthenticated users to the Clerk sign-in page automatically.
- Do not call `redirect("/sign-in")` inside a page or layout to enforce auth — that belongs in middleware only.

## Adding New Protected Routes

If a new top-level protected route is ever added, update the `createRouteMatcher` array in `middleware.ts`. Any route nested under `/dashboard` is automatically covered and requires no changes.

## Public Routes

Routes outside `/dashboard` (e.g. `/`, `/sign-in`, `/sign-up`) are public by default. Clerk UI components handle sign-in/sign-up — see `auth.md` for details.
