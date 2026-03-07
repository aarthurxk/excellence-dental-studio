

## Problem

The WhatsApp floating button is trapped inside the `PageTransition` component's `motion.div`. When framer-motion applies `transform` (for the animation), it creates a new CSS containing block -- this makes `position: fixed` elements behave like `position: absolute`, relative to the animated container instead of the viewport.

The button is rendered inside `Layout` → inside `PageTransition` → inside `motion.div` with transforms.

## Solution

Move the `WhatsAppButton` out of the `Layout` component and render it directly in `App.tsx`, outside the `AnimatePresence`/`PageTransition` wrapper. This way it sits at the top level of the DOM, unaffected by any transforms.

### Changes

1. **`src/components/layout/Layout.tsx`** -- Remove the `WhatsAppButton` import and usage from the Layout component.

2. **`src/App.tsx`** -- Import `WhatsAppButton` and render it as a sibling to `AppRoutes`, outside the router's animated routes, so it's always visible and truly fixed to the viewport.

