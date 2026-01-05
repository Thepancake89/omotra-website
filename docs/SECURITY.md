# Omotra Website — Security Guidelines

> **Purpose:** Security requirements and best practices for all code contributions. Non-negotiable rules to protect the site and user data.

---

## Critical Security Rules

### 1. Environment Variables

**NEVER commit secrets to the repository:**
```bash
# ❌ NEVER do this
const API_KEY = "sk-1234567890abcdef"
const DB_PASSWORD = "supersecret123"

# ✅ Always use environment variables
const apiKey = process.env.API_KEY
const dbPassword = process.env.DATABASE_PASSWORD
```

**Required files:**
- `.env.local` — local development (NEVER commit)
- `.env.example` — template with placeholder values (commit this)
- `.gitignore` — must include `.env*` patterns

**.gitignore must contain:**
```gitignore
# Environment files
.env
.env.local
.env.development
.env.production
.env*.local

# Sensitive
*.pem
*.key
secrets/
```

**Accessing env vars:**
```typescript
// Server-side (API routes, server components)
const secret = process.env.SECRET_KEY

// Client-side (must be prefixed)
const publicKey = process.env.NEXT_PUBLIC_ANALYTICS_ID
```

> ⚠️ Only `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets in NEXT_PUBLIC_ variables.

---

### 2. Form Handling & Validation

**Always validate on the server:**
```typescript
// app/api/contact/route.ts
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000),
  budget: z.enum(['under-2k', '2k-5k', '5k-10k', '10k-20k', '20k+', 'not-sure']).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = ContactSchema.parse(body)
    
    // Process validated data...
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input' }, { status: 400 })
    }
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
```

**Client-side validation is NOT security:**
```typescript
// ❌ This is for UX only — not security
<input required minLength={2} />

// ✅ Always validate server-side as well
// Server must not trust any client input
```

**Sanitise user input before display:**
```typescript
// React automatically escapes JSX — this is safe:
<p>{userInput}</p>

// ❌ NEVER use dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// If you MUST render HTML, sanitise first:
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

---

### 3. API Routes Security

**Rate limiting:**
```typescript
// Use Vercel's built-in or implement custom
// Example with upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }
  
  // Process request...
}
```

**CORS — restrict origins:**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://omotra.co.uk' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
}
```

**Validate request methods:**
```typescript
export async function POST(request: Request) {
  // Only POST is handled — other methods get 405
}

// Or explicitly:
export async function GET() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
```

---

### 4. Dependencies Security

**Before adding any dependency:**
1. Check npm audit: `npm audit`
2. Check bundle size: https://bundlephobia.com
3. Check maintenance: last update, open issues
4. Check downloads: is it widely used?
5. Prefer well-known packages over obscure ones

**Regular updates:**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

**Lock file:**
- Always commit `package-lock.json`
- Never delete it without good reason
- Use `npm ci` in CI/CD (not `npm install`)

---

### 5. Content Security Policy

**Add CSP headers in next.config.js:**
```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https:;
      connect-src 'self' https://api.omotra.co.uk;
    `.replace(/\n/g, '')
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

### 6. Authentication (If Added Later)

**Use established libraries:**
```typescript
// ✅ Use NextAuth.js / Auth.js
import NextAuth from 'next-auth'

// ❌ Don't roll your own auth
// ❌ Don't store passwords in plain text
// ❌ Don't use JWT without proper validation
```

**Session security:**
- Use HTTP-only cookies
- Set Secure flag in production
- Set SameSite=Strict or Lax
- Short session expiry with refresh tokens

---

### 7. Database (If Added Later)

**Use parameterised queries:**
```typescript
// ✅ Parameterised — safe from SQL injection
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
)

// ❌ String concatenation — SQL injection risk
const result = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
)
```

**Use an ORM:**
```typescript
// Prisma, Drizzle, or similar
const user = await prisma.user.findUnique({
  where: { email }
})
```

---

### 8. File Uploads (If Added Later)

**Never trust file extensions:**
```typescript
// ✅ Validate MIME type
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type')
}

// ✅ Limit file size
const maxSize = 5 * 1024 * 1024 // 5MB
if (file.size > maxSize) {
  throw new Error('File too large')
}

// ✅ Generate new filename — don't use user-provided names
const filename = `${crypto.randomUUID()}.${extension}`
```

**Store outside web root:**
- Use cloud storage (S3, Cloudflare R2)
- Never serve uploaded files directly from /public

---

### 9. Error Handling

**Never expose stack traces:**
```typescript
// ✅ Generic error to client
catch (error) {
  console.error('Contact form error:', error) // Log full error server-side
  return Response.json(
    { error: 'Something went wrong. Please try again.' },
    { status: 500 }
  )
}

// ❌ Never send error details to client
catch (error) {
  return Response.json({ error: error.message, stack: error.stack })
}
```

**Log errors properly:**
- Use structured logging
- Include request ID for tracing
- Don't log sensitive data (passwords, tokens, PII)

---

### 10. Third-Party Scripts

**Audit before adding:**
- Analytics: Use privacy-focused (Plausible, Fathom)
- Chat widgets: Review data collection policies
- Fonts: Self-host if possible for privacy

**Load safely:**
```typescript
// ✅ Use Next.js Script component with strategy
import Script from 'next/script'

<Script
  src="https://example.com/script.js"
  strategy="lazyOnload"  // or "afterInteractive"
/>

// ❌ Don't use inline scripts with external data
<script>var config = {user: "${userData}"}</script>
```

---

## Security Checklist Before Deploy

- [ ] No secrets in code or version control
- [ ] `.env.example` has no real values
- [ ] All forms have server-side validation
- [ ] Rate limiting on API routes
- [ ] Security headers configured
- [ ] Dependencies audited (`npm audit`)
- [ ] No `dangerouslySetInnerHTML` with user input
- [ ] Error messages don't leak internals
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Sensitive pages have appropriate caching headers

---

## Reporting Security Issues

If you discover a security vulnerability:
1. Do NOT open a public issue
2. Email: security@omotra.co.uk
3. Include: description, steps to reproduce, potential impact
4. Allow reasonable time for fix before disclosure
