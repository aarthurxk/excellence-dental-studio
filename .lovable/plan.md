

# Plan: Complete Layout Redesign

## Current Problem
Every section follows the same pattern: centered title + subtitle, grid of cards, repeat. The result is monotonous and generic. The Header is a standard sticky bar, the Hero is a simple dark gradient with left-aligned text, and all sections use identical `py-20` spacing with the same card style.

## New Design Philosophy
Break the repetitive rhythm with varied layouts, asymmetric compositions, overlapping elements, full-bleed sections, and bold visual contrast. Each section should feel distinct.

## Changes by Component

### Header (completely new)
- Transparent header on Hero, becomes solid white on scroll (using scroll state)
- Logo centered on mobile, left on desktop
- Nav links with animated underline indicator instead of color change
- CTA button with pill shape and subtle pulse animation

### Hero (dramatic redesign)
- Full viewport height (`min-h-screen`) split layout: left side has text content with staggered animations, right side has a large decorative shape (red circle/arc with clinic photo placeholder)
- Floating stats badges (e.g., "10+ anos", "5000+ pacientes") positioned absolutely around the hero
- Animated scroll-down indicator at bottom

### Features (horizontal scrolling strip)
- Instead of 4 equal cards in a grid, use a single horizontal band with a dark background
- 4 features displayed inline with icon + text, separated by thin vertical lines
- Compact, impactful — takes less vertical space

### Services (magazine-style layout)
- First service large (takes 2 columns), remaining in a staggered grid
- Each card has a colored left border accent instead of icon boxes
- Hover reveals a "Saiba mais" overlay

### About (overlapping layout)
- Text content overlaps a large background image area
- A floating card with stats (anos, pacientes, tratamentos) overlapping between the image and text
- Diagonal or angled background divider between sections

### Team (horizontal scroll carousel)
- Large circular photos with name/specialty overlay on hover
- Horizontal scrollable on mobile, grid on desktop
- No border cards — clean, photo-forward design

### Testimonials (single spotlight)
- One large featured testimonial with big quote marks and large text
- Smaller testimonials below in a 2-column layout
- Subtle gradient background

### Videos (asymmetric)
- One large featured video (takes 60% width), second smaller beside it
- Dark background section for contrast

### Events (timeline style)
- Vertical timeline with alternating left/right cards
- Date prominently displayed as a badge on the timeline line
- On mobile: single column with timeline on the left edge

### Location (full-width map)
- Map spans full width behind a floating contact info card
- Card has glassmorphism effect (backdrop-blur, semi-transparent)

### CTA Banner (bold split)
- Split into two halves: left red with WhatsApp CTA, right dark with phone CTA
- Diagonal divider between the two halves

### Footer (redesigned)
- 3-column layout with logo section more prominent
- Subtle red gradient line at top instead of plain border

## Files to Modify
1. `src/components/layout/Header.tsx` — transparent-to-solid scroll behavior, new nav style
2. `src/components/home/Hero.tsx` — full-height split layout with decorative elements
3. `src/components/home/Features.tsx` — horizontal dark band
4. `src/components/home/ServicesPreview.tsx` — magazine grid layout
5. `src/components/home/About.tsx` — overlapping elements
6. `src/components/home/Team.tsx` — carousel with circular photos
7. `src/components/home/Testimonials.tsx` — spotlight featured testimonial
8. `src/components/home/Videos.tsx` — asymmetric layout
9. `src/components/home/Events.tsx` — vertical timeline
10. `src/components/home/Location.tsx` — full-width map with floating card
11. `src/components/home/CTABanner.tsx` — split dual CTA
12. `src/components/layout/Footer.tsx` — refreshed layout
13. `src/index.css` — add custom utilities for diagonal clips, glassmorphism

## Technical Notes
- All animations remain via `framer-motion` v11.15.0
- No new dependencies needed
- Responsive: each creative layout degrades gracefully on mobile
- Same color palette (franchise red + dark) preserved

