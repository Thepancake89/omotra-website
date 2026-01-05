# Omotra Website — Project Rules

> **Purpose:** Guidelines for AI coding assistants and developers to maintain consistency, quality, and security across the codebase.

---

## Project Overview

- **Project:** Omotra marketing website
- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Hosting:** Vercel
- **Target:** UK SMBs in hospitality and outdoor activities

---

## Critical Rules — Do NOT Break

### 1. File Structure
```
app/
├── layout.tsx          # Root layout — DO NOT modify without approval
├── page.tsx            # Homepage
├── globals.css         # Global styles + Tailwind
├── [page]/page.tsx     # Each route has its own folder
components/
├── Navigation.tsx      # Site-wide nav
├── Footer.tsx          # Site-wide footer
├── Button.tsx          # Reusable button components
├── PageHeader.tsx      # Page header component
├── CTASection.tsx      # Call-to-action blocks
├── index.ts            # Component exports — keep updated
lib/
├── data.ts             # All site content and data
public/
├── images/             # Static images
├── fonts/              # Self-hosted fonts (if any)
```

### 2. Import Patterns — Always Use
```typescript
// Components — use barrel export
import { Navigation, Footer, Button } from '@/components'

// Data — use named imports
import { services, processSteps, projects } from '@/lib/data'

// Next.js
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

// React
import { useState, useEffect, useRef } from 'react'

// Framer Motion
import { motion } from 'framer-motion'
```

### 3. Component Patterns

**Server Components (default):**
```typescript
// app/services/page.tsx
import type { Metadata } from 'next'
import { PageHeader, CTASection } from '@/components'

export const metadata: Metadata = {
  title: 'Services',
  description: '...',
}

export default function ServicesPage() {
  return (...)
}
```

**Client Components (when needed):**
```typescript
// components/Navigation.tsx
'use client'  // MUST be first line

import { useState, useEffect } from 'react'
// ...
```

**When to use 'use client':**
- useState, useEffect, useRef hooks
- onClick, onChange, onSubmit handlers
- Browser APIs (window, document)
- Framer Motion animations
- usePathname, useRouter

### 4. Styling Rules

**Use Tailwind classes — NOT inline styles:**
```typescript
// ✅ Correct
<div className="bg-grey-900 text-cream p-8 rounded-2xl">

// ❌ Wrong
<div style={{ backgroundColor: '#1A1A1A', color: '#FAF8F5' }}>
```

**Use brand colour tokens:**
```typescript
// ✅ Correct — use configured tokens
className="bg-teal-deep text-coral border-cream/10"

// ❌ Wrong — hardcoded hex values
className="bg-[#0A3D42] text-[#E07A5F]"
```

**Brand Colours (defined in tailwind.config.ts):**
| Token | Hex | Usage |
|-------|-----|-------|
| `teal-deep` | #0A3D42 | Dark backgrounds, accents |
| `teal-mid` | #0F5C63 | Section backgrounds |
| `teal-light` | #1A7A82 | Highlights, gradients |
| `coral` | #E07A5F | Primary accent, CTAs |
| `coral-soft` | #F4A592 | Hover states, gradients |
| `cream` | #FAF8F5 | Text, light elements |
| `grey-800` | #2A2A2A | Subtle backgrounds |
| `grey-900` | #1A1A1A | Main background |

**Opacity with colours:**
```typescript
// Use Tailwind opacity syntax
className="text-cream/70"      // 70% opacity
className="border-cream/10"    // 10% opacity
className="bg-coral/15"        // 15% opacity
```

### 5. Typography

**Font families:**
```typescript
// Headings — Space Grotesk
className="font-display text-4xl font-medium tracking-tight"

// Body — Outfit
className="font-body text-base"  // or just default (no class needed)

// Code — JetBrains Mono
className="font-mono text-sm"
```

**Text sizes:**
- Hero titles: `text-5xl md:text-6xl lg:text-7xl`
- Page titles: `text-4xl md:text-5xl`
- Section titles: `text-3xl md:text-4xl`
- Card titles: `text-xl md:text-2xl`
- Body: `text-base` (16px)
- Small: `text-sm` (14px)
- Tiny: `text-xs` (12px)

### 6. Spacing Conventions

**Consistent padding:**
- Sections: `py-24 px-8 lg:px-16`
- Cards: `p-8` or `p-6`
- Page headers: `pt-40 pb-16 px-8 lg:px-16`

**Consistent gaps:**
- Grid gaps: `gap-6` or `gap-8`
- Flex gaps: `gap-4` or `gap-8`
- Stack spacing: `space-y-4` or `space-y-6`

### 7. Animation Patterns

**Framer Motion — standard variants:**
```typescript
// Fade up on scroll
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>

// Staggered children
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: i * 0.1 }}  // i = index
>

// Hover effects
<motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
```

**CSS animations (in globals.css):**
```css
.animate-fade-up { animation: fadeUp 0.8s ease forwards; }
.animate-float-in { animation: floatIn 1s ease forwards; }
.animate-pulse-dot { animation: pulse 2s ease infinite; }
```

---

## Content Management

**All content lives in `lib/data.ts`:**
- Services array
- Process steps array
- Projects/case studies array
- Stats array
- Values array
- Site config (name, email, etc.)

**To update content:** Edit `lib/data.ts` — do NOT hardcode content in components.

**To add a new page:**
1. Create `app/[pagename]/page.tsx`
2. Add metadata export
3. Use PageHeader and CTASection components
4. Add link to Navigation and Footer

---

## Performance Requirements

- **Lighthouse scores:** Aim for 90+ on all metrics
- **Images:** Always use `next/image` with width/height
- **Fonts:** Use `next/font` or preload
- **Bundle size:** Keep page JS under 100KB
- **No unused dependencies**

---

## Accessibility Requirements

- All images must have `alt` text
- Interactive elements must be keyboard accessible
- Colour contrast must meet WCAG AA (4.5:1 for text)
- Form inputs must have labels
- Focus states must be visible
- Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<section>`)

---

## Git Commit Messages

```
feat: add contact form validation
fix: resolve mobile nav z-index issue
style: update button hover states
refactor: extract PageHeader component
docs: update README with deploy steps
chore: upgrade Next.js to 14.2.1
```

---

## Questions Before Making Changes

Ask before:
1. Adding new dependencies
2. Changing the routing structure
3. Modifying layout.tsx
4. Changing brand colours or fonts
5. Adding third-party scripts
6. Changing build/deploy configuration

---

## File Naming

- **Components:** PascalCase (`PageHeader.tsx`)
- **Pages:** lowercase with hyphens (`app/case-studies/page.tsx`)
- **Utilities:** camelCase (`lib/formatDate.ts`)
- **Types:** PascalCase (`types/Project.ts`)
