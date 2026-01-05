# Omotra Website — Quick Reference Cheatsheet

> Print this or keep it open while coding.

---

## File Locations

```
app/layout.tsx         → Root layout (nav, footer, metadata)
app/page.tsx           → Homepage
app/[page]/page.tsx    → Individual pages
components/            → Reusable components
lib/data.ts            → ALL site content
lib/utils.ts           → Utility functions
public/                → Static assets
```

---

## Brand Colours (Tailwind)

| Token | Hex | Use For |
|-------|-----|---------|
| `grey-900` | #1A1A1A | Background |
| `grey-800` | #2A2A2A | Cards, subtle |
| `teal-deep` | #0A3D42 | Dark accents |
| `teal-mid` | #0F5C63 | Sections |
| `teal-light` | #1A7A82 | Highlights |
| `coral` | #E07A5F | CTAs, accents |
| `coral-soft` | #F4A592 | Hover states |
| `cream` | #FAF8F5 | Text |

```tsx
// Usage
className="bg-grey-900 text-cream"
className="bg-coral hover:bg-coral-soft"
className="text-cream/70"  // 70% opacity
className="border-cream/10"  // 10% opacity
```

---

## Typography

```tsx
// Headings (Space Grotesk)
className="font-display text-4xl font-medium tracking-tight"

// Body (Outfit - default)
className="text-base leading-relaxed"

// Code (JetBrains Mono)
className="font-mono text-sm"
```

**Sizes:**
- Hero: `text-5xl md:text-6xl lg:text-7xl`
- Page title: `text-4xl md:text-5xl`
- Section title: `text-3xl md:text-4xl`
- Card title: `text-xl md:text-2xl`
- Body: `text-base`
- Small: `text-sm`

---

## Common Patterns

### Server Component (Default)
```tsx
// app/example/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
}

export default function Page() {
  return <div>Content</div>
}
```

### Client Component
```tsx
// components/Interactive.tsx
'use client'  // ← First line!

import { useState } from 'react'

export default function Interactive() {
  const [state, setState] = useState(false)
  return <div onClick={() => setState(!state)}>...</div>
}
```

### Animation (Scroll)
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
```

### Animation (Stagger)
```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    transition={{ delay: i * 0.1 }}
    ...
  />
))}
```

### Conditional Classes
```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)}>
```

---

## Component Imports

```tsx
// Always use barrel export
import { 
  Navigation, 
  Footer, 
  Button, 
  PageHeader, 
  CTASection 
} from '@/components'

// Data
import { services, projects } from '@/lib/data'

// Utils
import { cn, formatDate } from '@/lib/utils'
```

---

## Responsive Breakpoints

| Prefix | Min Width | Device |
|--------|-----------|--------|
| (none) | 0 | Mobile |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large |

```tsx
// Mobile-first
<div className="px-4 md:px-8 lg:px-16">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## Spacing

**Sections:** `py-24 px-8 lg:px-16`  
**Cards:** `p-6` or `p-8`  
**Headers:** `pt-40 pb-16 px-8 lg:px-16`  
**Gaps:** `gap-4`, `gap-6`, `gap-8`  

---

## Common Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Check code style
npm run start    # Run production
npx tsc --noEmit # Type check
```

---

## Do / Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| Use Tailwind classes | Use inline styles |
| Use brand tokens | Hardcode hex colours |
| Add TypeScript types | Use `any` type |
| Handle errors | Ignore errors |
| Use `next/image` | Use `<img>` tag |
| Use `next/link` | Use `<a>` for internal |
| Validate server-side | Trust client input |
| Use env variables | Commit secrets |

---

## Security Checklist

- [ ] No secrets in code
- [ ] Server-side validation
- [ ] Error messages don't leak details
- [ ] Rate limiting on APIs
- [ ] Input sanitisation
- [ ] HTTPS only
- [ ] Dependencies audited

---

## Adding New Page

1. Create `app/pagename/page.tsx`
2. Add `export const metadata`
3. Use `PageHeader` + `CTASection`
4. Add to `Navigation.tsx`
5. Add to `Footer.tsx`
6. Test responsive design
7. Test keyboard nav

---

## Contact

- **Questions:** Ask before major changes
- **Bugs:** Create issue with steps to reproduce
- **Security:** security@omotra.co.uk (private)
