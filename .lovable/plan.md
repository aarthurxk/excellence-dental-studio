

## Problem

The WhatsApp floating button remains stuck/not floating correctly with scroll. Even though it was moved to `App.tsx` outside `AnimatePresence`, there may still be a CSS containing block issue from a parent element (e.g., a component with `transform`, `will-change`, or similar property) that prevents `position: fixed` from working relative to the viewport.

## Solution

Render the WhatsApp button using a **React Portal** (`ReactDOM.createPortal`) directly into `document.body`. This completely bypasses any React component tree CSS inheritance, guaranteeing the button is always fixed to the viewport.

### Changes

**`src/components/layout/WhatsAppButton.tsx`**:
- Import `createPortal` from `react-dom`
- Wrap the entire return JSX in `createPortal(..., document.body)`
- Remove the phone button (user chose to fix only WhatsApp)
- Keep existing `useSiteSettings` logic and styling intact

This is a single-file change. The button will render as a direct child of `<body>`, outside `<div id="root">`, making `position: fixed` work correctly regardless of any transforms or overflow in the React tree.

