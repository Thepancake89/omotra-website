# Omotra Website — Component Standards

> **Purpose:** Patterns and templates for building consistent, maintainable components.

---

## Component Types

### 1. Server Components (Default)

Use for static content, data fetching, SEO.

```typescript
// app/services/page.tsx
import type { Metadata } from 'next'
import { PageHeader, CTASection } from '@/components'
import { services } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Web development, business systems, and ongoing support for UK SMBs.',
}

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        tag="Services"
        title="What we build"
        subtitle="From websites to complete business systems."
      />
      
      <section className="py-24 px-8 lg:px-16">
        {/* Content */}
      </section>
      
      <CTASection
        title="Not sure what you need?"
        subtitle="Book a free consultation."
      />
    </>
  )
}
```

### 2. Client Components

Use for interactivity, browser APIs, animations.

```typescript
// components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components'

interface ContactFormProps {
  budgetOptions: { value: string; label: string }[]
}

export default function ContactForm({ budgetOptions }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Submit logic
      setIsSubmitted(true)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return <SuccessMessage />
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="p-8 rounded-3xl bg-cream/[0.02] border border-cream/10"
    >
      {/* Form fields */}
    </motion.form>
  )
}
```

### 3. Hybrid Pattern (Server + Client)

Server component for data, client component for interactivity.

```typescript
// app/work/page.tsx (Server Component)
import { projects } from '@/lib/data'
import ProjectGrid from './ProjectGrid'

export default function WorkPage() {
  return (
    <>
      <PageHeader tag="Work" title="Our projects" />
      <ProjectGrid projects={projects} />  {/* Client component */}
    </>
  )
}

// app/work/ProjectGrid.tsx (Client Component)
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Project { /* ... */ }

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState('all')
  
  return (
    <section className="py-24 px-8 lg:px-16">
      {/* Interactive filtering and animations */}
    </section>
  )
}
```

---

## Component Templates

### Page Template

```typescript
// app/[pagename]/page.tsx
import type { Metadata } from 'next'
import { PageHeader, CTASection } from '@/components'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description for SEO (150-160 characters).',
}

export default function PageName() {
  return (
    <>
      <PageHeader
        tag="Section Tag"
        title="Main Heading"
        subtitle="Supporting text that explains the page purpose."
      />

      <section className="py-24 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Page content */}
        </div>
      </section>

      <CTASection
        title="Call to action"
        subtitle="Compelling reason to take action."
        buttonText="Action Text"
        buttonHref="/contact"
      />
    </>
  )
}
```

### Reusable UI Component Template

```typescript
// components/Card.tsx
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'highlighted'
  onClick?: () => void
}

export function Card({
  children,
  className,
  variant = 'default',
  onClick,
}: CardProps) {
  const baseStyles = 'rounded-3xl border transition-all duration-300'
  
  const variants = {
    default: 'bg-cream/[0.02] border-cream/10 hover:border-cream/15',
    highlighted: 'bg-teal-deep/50 border-teal-light/20 hover:border-teal-light/40',
  }

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}
```

### Animated Section Template

```typescript
// components/AnimatedSection.tsx
'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
}: AnimatedSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.section>
  )
}
```

---

## Props Interface Patterns

### Required vs Optional Props

```typescript
interface ButtonProps {
  // Required
  children: ReactNode
  
  // Optional with defaults
  variant?: 'primary' | 'secondary'  // default: 'primary'
  size?: 'sm' | 'md' | 'lg'          // default: 'md'
  
  // Optional, no default
  href?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
}
```

### Extending HTML Elements

```typescript
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  isLoading,
  children,
  disabled,
  ...props  // Spread remaining HTML attributes
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}
```

---

## Styling Patterns

### Conditional Classes

```typescript
// Using template literals
<div className={`
  base-class
  ${isActive ? 'active-class' : 'inactive-class'}
  ${size === 'lg' ? 'text-lg p-6' : 'text-base p-4'}
`}>

// Using cn() utility (recommended)
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  size === 'lg' && 'text-lg p-6',
  className  // Allow override from props
)}>
```

### cn() Utility

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Responsive Classes

```typescript
// Mobile-first approach
<div className="
  px-4 py-8           // Mobile (default)
  md:px-8 md:py-12    // Tablet (768px+)
  lg:px-16 lg:py-24   // Desktop (1024px+)
">

// Grid responsive
<div className="
  grid
  grid-cols-1         // Mobile: 1 column
  md:grid-cols-2      // Tablet: 2 columns
  lg:grid-cols-3      // Desktop: 3 columns
  gap-6
">
```

---

## Animation Patterns

### Scroll-Triggered (Framer Motion)

```typescript
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
```

### Staggered Children

```typescript
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
  >
    {/* Item content */}
  </motion.div>
))}
```

### Hover Effects

```typescript
// Framer Motion
<motion.div
  whileHover={{ y: -8, scale: 1.02 }}
  transition={{ duration: 0.2 }}
>

// CSS (in Tailwind)
<div className="transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.02]">
```

### Page Transitions

```typescript
// In layout or page wrapper
<motion.main
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.main>
```

---

## Accessibility Patterns

### Interactive Elements

```typescript
// Clickable cards
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-coral"
>

// Links that look like buttons
<Link
  href="/contact"
  className="inline-flex items-center px-6 py-3 bg-coral text-white rounded-full"
>
  Get in touch
</Link>
```

### Form Labels

```typescript
// Always associate labels with inputs
<div className="form-group">
  <label htmlFor="email" className="block text-sm mb-2">
    Email address
  </label>
  <input
    id="email"
    type="email"
    name="email"
    required
    aria-describedby="email-hint"
    className="w-full px-4 py-3 rounded-xl"
  />
  <p id="email-hint" className="text-sm text-cream/50 mt-1">
    We'll never share your email.
  </p>
</div>
```

### Loading States

```typescript
<button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? (
    <>
      <span className="sr-only">Loading</span>
      <Spinner aria-hidden="true" />
    </>
  ) : (
    'Submit'
  )}
</button>
```

---

## Common Mistakes to Avoid

### ❌ Don't

```typescript
// Hardcoded content in components
<h1>Welcome to Omotra</h1>

// Inline styles
<div style={{ color: '#E07A5F' }}>

// Missing keys in lists
{items.map(item => <div>{item.name}</div>)}

// Non-semantic HTML
<div onClick={handleClick}>Click me</div>

// Prop drilling through many levels
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data} />
```

### ✅ Do

```typescript
// Content from data files
<h1>{siteConfig.headline}</h1>

// Tailwind classes
<div className="text-coral">

// Keys on list items
{items.map(item => <div key={item.id}>{item.name}</div>)}

// Semantic HTML
<button onClick={handleClick}>Click me</button>

// Context or composition for deep data
<DataProvider value={data}>
  <Parent>
    <Child>
      <GrandChild />  // Uses useContext
```

---

## Component Checklist

Before submitting a component:

- [ ] TypeScript types defined for all props
- [ ] Default values for optional props
- [ ] Responsive design (mobile-first)
- [ ] Keyboard accessible
- [ ] Focus states visible
- [ ] Loading/error states handled
- [ ] No console errors or warnings
- [ ] Follows naming conventions
- [ ] Uses brand colours from tokens
- [ ] Animations respect reduced-motion preference
