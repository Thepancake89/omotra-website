# AI Coding Assistant Rules — Omotra Website

> **For:** Cursor, GitHub Copilot, Claude, ChatGPT, and other AI coding tools
> **Project:** Omotra marketing website (Next.js 14 + TypeScript + Tailwind)

---

## Before You Write Any Code

1. **Read the relevant docs first:**
   - `PROJECT_RULES.md` — Structure, patterns, conventions
   - `SECURITY.md` — Security requirements (non-negotiable)
   - `COMPONENT_STANDARDS.md` — How to build components

2. **Check existing code:**
   - Does a similar component already exist?
   - What patterns are used elsewhere in the codebase?
   - Is there a utility function that does what you need?

3. **Understand the task:**
   - What is the expected outcome?
   - What should NOT change?
   - Are there security implications?

---

## Strict Rules — Never Break These

### Code Safety

```
❌ NEVER commit API keys, passwords, or secrets
❌ NEVER use dangerouslySetInnerHTML with user input
❌ NEVER skip server-side validation
❌ NEVER use eval() or Function() constructor
❌ NEVER disable TypeScript strict mode
❌ NEVER ignore security warnings
```

### Project Structure

```
❌ NEVER modify layout.tsx without explicit approval
❌ NEVER change the routing structure without approval
❌ NEVER add dependencies without checking necessity
❌ NEVER delete package-lock.json
❌ NEVER hardcode content that should be in lib/data.ts
```

### Code Quality

```
❌ NEVER leave console.log in production code
❌ NEVER use 'any' type — be specific
❌ NEVER skip error handling
❌ NEVER ignore accessibility requirements
❌ NEVER use inline styles (use Tailwind)
```

---

## Tech Stack — Use Only These

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.x |
| Animation | Framer Motion | 11.x |
| Forms | React Hook Form + Zod | Latest |
| Icons | Lucide React | Latest |

**Do NOT add:**
- jQuery or vanilla JS libraries
- CSS-in-JS (styled-components, emotion)
- State management (Redux, Zustand) — not needed
- Other UI frameworks (Material, Chakra, etc.)

---

## Correct Patterns

### File Creation

```typescript
// ✅ New page
// Location: app/[pagename]/page.tsx
import type { Metadata } from 'next'
import { PageHeader, CTASection } from '@/components'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Description here.',
}

export default function PageName() {
  return (...)
}
```

```typescript
// ✅ New component
// Location: components/ComponentName.tsx
'use client'  // Only if needed

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ComponentNameProps {
  // Define props
}

export default function ComponentName({ ...props }: ComponentNameProps) {
  return (...)
}

// Then add to components/index.ts:
export { default as ComponentName } from './ComponentName'
```

### Imports

```typescript
// ✅ Correct import order
// 1. React/Next
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 2. Third-party
import { motion } from 'framer-motion'

// 3. Internal components
import { Button, PageHeader } from '@/components'

// 4. Internal utilities/data
import { cn } from '@/lib/utils'
import { services } from '@/lib/data'

// 5. Types
import type { Service } from '@/types'
```

### Styling

```typescript
// ✅ Use Tailwind with brand tokens
<div className="bg-grey-900 text-cream">
<button className="bg-coral hover:bg-coral-soft">
<span className="text-cream/70">

// ✅ Responsive design
<div className="px-4 md:px-8 lg:px-16">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ Conditional classes
<div className={cn(
  'base-styles',
  isActive && 'active-styles',
  className
)}>
```

### Forms

```typescript
// ✅ Form with validation
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short'),
})

type FormData = z.infer<typeof schema>

export default function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    // Handle submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### API Routes

```typescript
// ✅ API route with validation
// app/api/contact/route.ts
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  message: z.string().min(10).max(5000),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    
    // Process data...
    
    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('API error:', error)
    return Response.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
```

---

## Wrong Patterns — Do NOT Use

```typescript
// ❌ Hardcoded colours
<div style={{ color: '#E07A5F' }}>
<div className="bg-[#1A1A1A]">

// ❌ Missing TypeScript types
function Component(props) {  // No types!
const data: any = fetchData()  // any type!

// ❌ Inline event handlers with complex logic
<button onClick={() => {
  doThing1()
  doThing2()
  doThing3()
}}>

// ❌ Client component without 'use client'
import { useState } from 'react'  // Will error!

// ❌ Index as key
{items.map((item, i) => <div key={i}>{item}</div>)}

// ❌ Non-semantic HTML
<div onClick={click}>Click me</div>

// ❌ Missing error handling
const data = await fetch(url)  // What if it fails?

// ❌ Console logs
console.log('debug', data)

// ❌ Disabling ESLint
// eslint-disable-next-line
```

---

## Brand Design Tokens

**Always use these — never hardcode hex values:**

```typescript
// Colours
'teal-deep'     // #0A3D42 — Dark backgrounds
'teal-mid'      // #0F5C63 — Section backgrounds  
'teal-light'    // #1A7A82 — Highlights, links
'coral'         // #E07A5F — Primary accent, CTAs
'coral-soft'    // #F4A592 — Hover states
'cream'         // #FAF8F5 — Text, light elements
'grey-800'      // #2A2A2A — Subtle backgrounds
'grey-900'      // #1A1A1A — Main background

// Fonts
'font-display'  // Space Grotesk — Headings
'font-body'     // Outfit — Body text (default)
'font-mono'     // JetBrains Mono — Code

// Opacity
'text-cream/70' // 70% opacity
'border-cream/10' // 10% opacity
'bg-coral/15' // 15% opacity
```

---

## When Asked to Make Changes

### Safe Changes (Proceed)
- Fixing typos or content in `lib/data.ts`
- Adding new pages following existing patterns
- Creating new components that follow standards
- Fixing bugs without changing architecture
- Improving accessibility
- Adding tests

### Risky Changes (Ask First)
- Adding new npm dependencies
- Modifying `layout.tsx` or `globals.css`
- Changing routing structure
- Modifying build configuration
- Adding third-party scripts
- Changing authentication/security logic

### Dangerous Changes (Do Not Do)
- Removing security validations
- Exposing environment variables
- Disabling TypeScript checks
- Adding unvetted dependencies
- Bypassing rate limiting
- Storing sensitive data client-side

---

## Testing Your Changes

Before considering code complete:

```bash
# 1. Type check
npm run type-check  # or: npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Build succeeds
npm run build

# 4. No console errors in browser
npm run dev  # Check browser console

# 5. Responsive design works
# Test at 375px, 768px, 1024px, 1440px widths

# 6. Keyboard navigation works
# Tab through the page, ensure focus is visible
```

---

## Response Format

When generating code, always:

1. **State what you're creating/modifying**
2. **Show the file path**
3. **Provide complete, working code**
4. **Explain any non-obvious decisions**
5. **Note any follow-up actions needed**

Example:
```
Creating a new ServiceCard component.

File: components/ServiceCard.tsx

[complete code here]

This component:
- Uses the Card base component
- Accepts service data as props
- Includes hover animation
- Is keyboard accessible

After adding, update components/index.ts to export it.
```

---

## Quick Reference

| Task | Pattern |
|------|---------|
| New page | `app/[name]/page.tsx` with metadata |
| New component | `components/Name.tsx` + export in index.ts |
| Add content | Edit `lib/data.ts` |
| Style element | Tailwind classes, brand tokens |
| Add interactivity | 'use client' + hooks |
| Add animation | Framer Motion |
| Form validation | Zod schema |
| API endpoint | `app/api/[name]/route.ts` |
