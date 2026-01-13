# Omotra Website

Static HTML/CSS/JS website for Omotra — web development and business systems for UK SMBs.

---

## Quick Start

### For Viewing Only

1. **Download/clone this folder**
2. **Open `index.html` in your browser** — that's it!

### For Full Functionality (including contact form)

1. **Download/clone this folder**
2. **Install dependencies**: `npm install`
3. **Set up environment variables** (see Contact Form Setup below)
4. **Run locally**: `vercel dev`
5. **Deploy**: `vercel --prod`

---

## File Structure

```
omotra-website/
├── index.html          # Homepage
├── services.html       # Services page
├── process.html        # Process page
├── work.html           # Work/Portfolio page
├── about.html          # About page
├── contact.html        # Contact page (with form)
├── privacy.html        # Privacy policy
├── css/
│   └── styles.css      # All styles
├── js/
│   └── main.js         # Navigation, animations, form handling
├── api/
│   └── contact.js      # Vercel serverless function for contact form
├── images/             # Your images go here
├── package.json        # Dependencies (Resend SDK)
├── .env.local          # Local environment variables (never commit)
├── .env.local.example  # Template for environment variables
└── docs/               # AI coder documentation
    ├── AI_CODING_RULES.md
    ├── PROJECT_RULES.md
    ├── SECURITY.md
    ├── COMPONENT_STANDARDS.md
    └── CHEATSHEET.md
```

---

## Editing Content

All content is directly in the HTML files. To update:

1. Open the relevant `.html` file in a text editor
2. Find the text you want to change
3. Edit and save
4. Refresh browser to see changes

### Common Edits

| What | Where |
|------|-------|
| Services | `services.html` |
| Process steps | `process.html` |
| Case studies | `work.html` |
| About text | `about.html` |
| Contact email | `contact.html` + all footers |
| Stats on homepage | `index.html` (Stats Bar section) |
| Navigation links | All pages (nav element) |
| Footer links | All pages (footer element) |

---

## Contact Form Setup with Resend & Vercel

The contact form uses a Vercel serverless function to send emails via Resend API. This provides reliable email delivery with built-in spam protection.

### Prerequisites

1. **Resend Account** - Sign up at [resend.com](https://resend.com)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Verified Domain** - Verify your sending domain in Resend

### Step 1: Set Up Resend

1. Create account at [resend.com](https://resend.com)
2. Go to **Domains** and verify your sending domain
   - Add DNS records as instructed
   - Wait for verification (usually a few minutes)
3. Go to **API Keys** and create a new API key
   - Save this key securely (you'll need it for environment variables)

### Step 2: Local Development Setup

1. **Create `.env.local` file** in the project root:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@omotra.com
CONTACT_EMAIL=build@omotra.com
```

⚠️ **IMPORTANT**: Never commit `.env.local` to git. It's already in `.gitignore`.

2. **Install dependencies**:

```bash
npm install
```

3. **Install Vercel CLI**:

```bash
npm install -g vercel
```

4. **Test locally**:

```bash
vercel dev
```

Open `http://localhost:3000` and test the contact form.

### Step 3: Deploy to Vercel

1. **Deploy the site**:

```bash
vercel
```

Follow the prompts to create/link a project.

2. **Configure Environment Variables** in Vercel Dashboard:
   - Go to your project on [vercel.com](https://vercel.com)
   - Navigate to **Settings → Environment Variables**
   - Add these variables for **all environments** (Production, Preview, Development):

| Variable Name | Value | Example |
|--------------|-------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_abc123...` |
| `RESEND_FROM_EMAIL` | Verified sender email | `noreply@omotra.com` |
| `CONTACT_EMAIL` | Where to receive submissions | `build@omotra.com` |

3. **Deploy to production**:

```bash
vercel --prod
```

### Spam Protection

The contact form includes multiple layers of protection:

1. **Honeypot Field** - Hidden field that bots will fill
2. **Timing Check** - Rejects submissions faster than 3 seconds (bots)
3. **Rate Limiting** - Maximum 5 submissions per IP address per hour
4. **Server-Side Validation** - All inputs validated on the server

### Environment Variables Template

Create a file `.env.local.example` (safe to commit) with placeholders:

```bash
# Resend API Configuration
# Get your API key from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxx

# Verified sender email in Resend
# Must be verified at: https://resend.com/domains
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Email address to receive contact form submissions
CONTACT_EMAIL=your-email@yourdomain.com
```

### Security Best Practices

✅ **DO:**
- Store all secrets in environment variables
- Use `.env.local` for local development
- Configure production secrets in Vercel Dashboard
- Keep `.env.local` in `.gitignore`

❌ **DON'T:**
- Never commit `.env.local` to git
- Never hardcode API keys in code files
- Never share environment variable values publicly

### Verify Security Before Committing

```bash
# Check what would be committed
git status

# Verify .env.local is ignored
git check-ignore .env.local
# Should output: .env.local

# Check staged files for secrets
git diff --cached
# Should NOT show any API keys
```

### Troubleshooting

**Issue: Emails not being sent**
- Check Resend API key is correct in Vercel
- Verify sending domain is verified in Resend
- Check Vercel function logs for errors

**Issue: "Missing required environment variables"**
- Verify all 3 variables are set in Vercel Dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding environment variables

**Issue: Getting 429 (rate limited) errors**
- This is working correctly - 5 submissions per IP per hour
- Wait 1 hour or test from different network
- In development, restart `vercel dev` to clear rate limit

**Issue: Form submitted too quickly error**
- This is working correctly - minimum 3 second delay
- Legitimate users won't trigger this
- Catches bots that auto-submit immediately

---

## Hosting

### Recommended: Vercel (Free)

**Required for contact form functionality** - The contact form uses Vercel serverless functions.

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in project directory
3. Follow prompts to create/link project
4. Configure environment variables (see Contact Form Setup above)
5. Deploy: `vercel --prod`

Your site will be live at `your-project.vercel.app` with a free SSL certificate.

### Alternative: Netlify (Free)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop this folder
3. Done! Get a free URL

**Note:** Contact form won't work on Netlify without modification. You'll need to replace the Vercel serverless function with Netlify Functions or use a third-party service like Formspree.

### Alternative: GitHub Pages (Free)

1. Push to GitHub repository
2. Settings → Pages → Deploy from main branch
3. Access at `yourusername.github.io/repo-name`

**Note:** Contact form won't work on GitHub Pages (static hosting only). Consider using Formspree or similar service.

### Alternative: Any Web Host

Upload all files via FTP to your hosting provider.

**Note:** Contact form requires serverless function support. Without it, you'll need to use a third-party email service.

---

## Customising Styles

All styles are in `css/styles.css`. Key sections:

| Section | Line ~# | What |
|---------|---------|------|
| CSS Variables | 1-20 | Brand colours, fonts |
| Navigation | 100-200 | Header, mobile menu |
| Hero | 270-450 | Homepage hero section |
| Sections | 500-600 | General section styling |
| Services | 620-750 | Service cards |
| Process | 760-850 | Process steps |
| Projects | 860-980 | Case study cards |
| Contact | 1050-1150 | Contact form |
| Footer | 1200-1280 | Footer styles |

### Changing Colours

Update CSS variables at the top of `styles.css`:

```css
:root {
  --teal-deep: #0A3D42;
  --teal-mid: #0F5C63;
  --teal-light: #1A7A82;
  --coral: #E07A5F;        /* Primary accent */
  --coral-soft: #F4A592;   /* Hover states */
  --cream: #FAF8F5;        /* Text colour */
  --grey-900: #1A1A1A;     /* Background */
}
```

---

## Adding Images

1. Add images to the `images/` folder
2. Reference in HTML:

```html
<img src="images/your-image.jpg" alt="Description">
```

For project images, replace the placeholder divs in `work.html`:

```html
<!-- Before -->
<div class="project-image" style="background: ...">◈</div>

<!-- After -->
<div class="project-image">
  <img src="images/project-1.jpg" alt="Hal Court website">
</div>
```

---

## SEO Checklist

Before going live:

- [ ] Update `<title>` tags on all pages
- [ ] Update `<meta name="description">` on all pages
- [ ] Add Open Graph image (`og:image`) — create `images/og-image.png` (1200x630)
- [ ] Update `og:url` to your actual domain
- [ ] Submit sitemap to Google Search Console

---

## Browser Support

Works in all modern browsers:
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Performance

This site is already optimised:
- Single CSS file (~15KB)
- Single JS file (~3KB)
- No external dependencies (except Google Fonts)
- Efficient animations with CSS transforms

For even better performance:
- Compress images before uploading
- Enable gzip compression on your server
- Use a CDN (Netlify/Vercel include this)

---

## Documentation for AI Coders

The `docs/` folder contains rules for AI coding assistants:

- `AI_CODING_RULES.md` — Primary rules file
- `PROJECT_RULES.md` — Structure and conventions
- `SECURITY.md` — Security guidelines
- `CHEATSHEET.md` — Quick reference

Copy `AI_CODING_RULES.md` to `.cursorrules` if using Cursor.

---

## Support

Email: hello@omotra.com
