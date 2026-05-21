# UI Coding Standards

## Component Library

**All UI components must use shadcn/ui exclusively.**

- Do not create custom components. Every UI element — buttons, inputs, dialogs, cards, tables, badges, etc. — must come from the shadcn/ui component library.
- Install new shadcn/ui components via `npx shadcn@latest add <component>` before using them.
- Do not wrap shadcn/ui components in custom wrapper components. Use them directly.
- shadcn/ui components live in `src/components/ui/`. Do not modify these files.

## Date Formatting

Use `date-fns` for all date formatting. Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the `do MMM yyyy` format token with `date-fns/format`:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```

Do not use `toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach.
