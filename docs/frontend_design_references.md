# Frontend Design References

Prepared: 2026-07-29

This note captures design/frontend references for VIBEWEAR and how they should be used. Treat these as inspiration and candidate implementation tools, not as automatic dependencies.

## Current Project Fit

VIBEWEAR is a Next.js React app with custom CSS and lucide-react icons. It does not currently use Tailwind CSS or shadcn/ui, so shadcn-registry component libraries should be evaluated before adoption rather than installed casually.

## Recommended Use

### Motion

Source: https://motion.dev/docs/react-animation

Primary candidate for React animations. Motion works directly with React components via `motion` elements, supports hover/tap/in-view interactions, enter/exit animation, layout animation, variants, and animation hooks.

Use for:

- product-card hover and tap states
- filter drawer/advanced filter transitions
- search result enter/reorder transitions
- route/page micro-transitions
- reduced-motion-aware UI polish

Implementation notes:

- Install with `npm install motion`.
- In Next.js App Router, use client components with `import { motion } from "motion/react"` or reduce client JS with `import * as motion from "motion/react-client"` where applicable.
- Wrap app/client UI with `MotionConfig reducedMotion="user"` or handle `useReducedMotion` manually.

Decision: preferred animation library for normal React UI.

### Anime.js

Source: https://animejs.com/documentation/

Powerful general-purpose JavaScript animation engine with timelines, SVG, draggable, layout, text, WAAPI, utilities, easings, and scoped React integration.

Use for:

- special campaign/hero experiments
- SVG line/path animation
- text animation experiments
- complex timeline sequences outside normal React component state

Implementation notes:

- Install with `npm install animejs`.
- In React, scope animations with `createScope()` inside `useEffect()` and cleanup with `scope.current.revert()`.

Decision: secondary tool for special effects. Do not use as the default React animation layer while Motion covers the common UI cases.

### Kokonut UI

Source: https://kokonutui.com/docs

Copy/install component collection for React/Next.js built around Tailwind CSS v4, shadcn/ui, Motion, and lucide icons. Useful as a visual reference for animated navigation, search bars, cards, buttons, and AI-style interaction patterns.

Useful references:

- Action Search Bar
- Morphic Navbar
- Smooth Drawer
- Smooth Tab
- Spotlight Cards
- Toolbar

Implementation notes:

- Requires shadcn CLI flow and Tailwind CSS v4 for normal registry use.
- If used before a Tailwind migration, copy the interaction idea and rebuild in local CSS instead of importing the component directly.

Decision: strong inspiration source; adopt actual components only if the project moves to Tailwind/shadcn.

### Bklit UI

Source: https://bklit.com/docs

Chart and data visualization components built on top of shadcn/ui. Best fit is the future operator/admin side of VIBEWEAR, not the shopper-facing catalog.

Use for:

- search CTR charts
- outbound click charts
- feed import success/failure dashboards
- store performance and zero-result query reporting
- revenue/cost/funnel views after affiliate reporting starts

Implementation notes:

- Requires shadcn/ui setup.
- Registry namespace is `@bklit`; example install: `npx shadcn@latest add @bklit/area-chart`.

Decision: keep for analytics/admin dashboard phase, not current public storefront polish.

### Manus

Source: https://www.manus.im/features/webapp

AI product builder/reference. Manus is useful less as a code dependency and more as a product-design reference: fast concepting, full-stack app generation, SEO positioning, analytics, lead capture, visual editing, versioning, and no-lock-in messaging.

Use for:

- studying product flows and positioning
- generating alternate UI concepts outside the repo
- comparing our own agent workflow expectations
- inspiration for admin/operator UX

Decision: reference/benchmark only. Do not add Manus as a frontend dependency.

## Near-Term Direction For VIBEWEAR

1. Keep the public storefront restrained and fashion-first.
2. Add Motion for small UI transitions only after search/clickout behavior is tested.
3. Avoid Tailwind/shadcn migration until there is a concrete component set worth adopting.
4. Use Kokonut ideas selectively for search/nav/card polish.
5. Use Bklit later for an internal analytics dashboard once `search_events` and `outbound_clicks` are live.
6. Keep animations accessible: respect reduced motion, avoid large parallax, and avoid decorative motion that slows product inspection.
