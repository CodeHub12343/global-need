# Meeting Global Needs

A humanitarian cause discovery and verification platform — Platform 1 of the Three-Platform Ecosystem.

## Stack

- **Next.js 14** with the App Router
- **TypeScript** throughout
- **Styled Components** for all styling (no Tailwind, no CSS framework)
- **Lucide React** icons
- **React Hook Form** for form state

## Design canvas

The full UI/UX for this platform lives in a 34-artboard Design canvas covering: Public website, authentication, organization dashboard, reviewer workspace, and super-admin control center. This codebase implements that design system in code.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  (public)/          Public website routes
  (auth)/            Sign in, register, forgot/reset password, verify email
  dashboard/         Organization representative dashboard
  reviewer/          Reviewer workspace
  admin/             Super administrator control center
components/
  layout/            Nav, footer, sidebars, topbars
  ui/                Buttons, cards, pills, inputs, metric cards, etc.
  causes/            Cause cards, cause-specific blocks
lib/
  theme.ts           Design tokens (colors, type, spacing, radii)
  registry.tsx       styled-components SSR registry
  mock-data.ts       Illustrative sample content for the UI
```

## Design principles in this codebase

- **Illustrative sample content only.** No fabricated donation totals or beneficiary counts.
- **Privacy by default.** Supporting documents stay private; the UI makes that visible.
- **No donation checkout.** Deliberately out of scope for the MVP.
- **Role-aware navigation.** Public, dashboard, reviewer, and admin surfaces are separate.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run typecheck` — TypeScript check without emit
- `npm run lint` — ESLint
