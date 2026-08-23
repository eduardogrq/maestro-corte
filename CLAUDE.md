# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Project Overview

**Maestro Corte by Diego** — Professional barber service website for an at-home barbershop in Mexico City (CDMX). The primary goal is lead generation via WhatsApp, building trust, and local SEO positioning.

---

## Commands

```bash
pnpm dev          # dev server (Turbopack)
pnpm build        # production build — must pass with zero errors
pnpm lint         # eslint
```

---

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript strict
- Tailwind CSS v4
- Framer Motion (animations)
- pnpm as package manager

---

## Architecture

```
src/
├── app/                    ← Pages, layout, sitemap, robots
├── components/
│   ├── layout/             ← Header, Footer, JsonLd
│   ├── sections/           ← Page sections (Hero, Experience, Services, Process, Zones, Testimonials, CtaFinal)
│   └── ui/                 ← Reusable UI components (MotionWrapper)
├── data/                   ← Centralized business data (business.ts, services.ts, testimonials.ts, locations.ts)
├── lib/                    ← Utilities (utils.ts, animations.ts)
└── types/                  ← TypeScript interfaces
```

---

## Design System

### Brand Colors (from logo)

| Token          | Value     | Use                         |
|----------------|-----------|------------------------------|
| --background   | #F7F3EE   | Warm cream page background   |
| --foreground   | #1A1A1A   | Near-black text              |
| --surface      | #EFEBE5   | Alternate section bg         |
| --surface-dark | #2C2825   | Dark sections (CTA, footer)  |
| --muted        | #8C8377   | Secondary text               |
| --accent       | #B8956B   | Muted gold (from logo)       |
| --border       | #E2DDD6   | Subtle borders               |

### Typography

- **Headings**: Playfair Display (serif, editorial) via `font-serif`
- **Body**: DM Sans (modern sans) via `font-sans`
- Both loaded via `next/font/google` with `display: swap`

### Visual Direction

- Editorial, warm, photography-driven layout
- Premium but NOT elitist — accessible to middle/upper-middle class CDMX
- Large serif typography + generous whitespace + subtle motion
- NO: barber pole clichés, skulls, excessive gold, black backgrounds, SaaS aesthetic, ThemeForest templates
- YES: composition, rhythm, negative space, scroll storytelling, micro-interactions

---

## Animation Rules

- Framer Motion for scroll reveals (`whileInView`) and staggered entrances
- CSS transitions for hovers/interactions
- Always respect `prefers-reduced-motion`
- Subtle only — animation supports content, never competes
- Variants defined in `src/lib/animations.ts`

---

## Data Architecture

All business content is centralized in `src/data/`:
- `business.ts` — name, phone, WhatsApp, hours, URLs, coverage
- `services.ts` — service catalog
- `testimonials.ts` — mock testimonials (clearly marked for replacement)
- `locations.ts` — zones and process steps

This enables future migration to CMS/DB without touching UI components.

---

## SEO Strategy

- Metadata API with `metadataBase`, title templates, OG/Twitter cards
- JSON-LD structured data (BarberShop schema) in `components/layout/json-ld.tsx`
- `app/sitemap.ts` and `app/robots.ts`
- Semantic HTML, proper heading hierarchy, descriptive alt texts
- Target keywords: "barbería a domicilio CDMX", "barbero a domicilio", local zones
- NO keyword stuffing — content must sound natural and human
- Architecture prepared for future local landing pages (`/barberia-a-domicilio-coyoacan`, etc.)

---

## Language & Content Rules

- **Code**: English (variables, functions, components, types, file names)
- **UI content**: Spanish (Mexican Spanish) — warm, professional, non-corporate tone
- **Copywriting tone**: cercano, masculino, elegante, confiable, sencillo
- NO: exaggerations, corporate language, "la mejor barbería del mundo", pretentious phrasing

---

## Performance Goals

- Lighthouse: Performance 95+, Accessibility 95+, Best Practices 95+, SEO 100
- Server Components by default; `"use client"` only when necessary
- Optimize LCP, CLS, INP
- Minimize JS shipped to browser
- `next/image` for all images, `next/font` for fonts

---

## Images

Currently using placeholder divs. Designed for future professional photography of:
- Barber working
- Finished cuts (fade, classic)
- Tools/equipment
- Client at home
- CDMX apartment interiors

Placeholder locations are clearly marked with TODO comments.

---

## Key Business Data (for consistency)

- **Name**: Maestro Corte by Diego
- **Service**: Barbería a domicilio
- **Experience**: 35+ years
- **Coverage**: Coyoacán, Benito Juárez, zonas cercanas CDMX
- **Hours**: Lunes a Sábado, 9:00–19:00
- **CTA**: WhatsApp (wa.me link with pre-filled message)

---

## Development Rules

1. Never add features/refactoring beyond what was asked
2. Don't use `any` — strict TypeScript
3. After changes: verify `pnpm build` passes
4. Never push without explicit permission
5. Mobile-first responsive design
6. Accessibility: semantic HTML, keyboard nav, focus visible, aria when needed
7. Don't install dependencies unless CSS/React can't achieve the same result
