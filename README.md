# Omotra Website

Static HTML/CSS/JS website for Omotra — web development and business systems for UK SMBs.

---

## Quick Start

1. **Download/clone this folder**
2. **Open `index.html` in your browser** — that's it!

No build step, no Node.js, no npm required.

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
├── images/             # Your images go here
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

## Contact Form

The contact form in `contact.html` currently shows a success message but doesn't actually send emails.

### Option 1: Formspree (Easiest)

1. Sign up at [formspree.io](https://formspree.io)
2. Create a form
3. Replace the form action in `contact.html`:

```html
<form id="contact-form" action="https://formspree.io/f/YOUR_ID" method="POST">
```

4. Remove or modify the JavaScript form handling in `js/main.js`

### Option 2: Netlify Forms

If hosting on Netlify:

```html
<form name="contact" method="POST" data-netlify="true">
```

### Option 3: Google Forms

Link to your Google Form or embed it.

---

## Hosting

### Option 1: Netlify (Free)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop this folder
3. Done! Get a free URL

### Option 2: Vercel (Free)

1. Go to [vercel.com](https://vercel.com)
2. Import this folder
3. Deploy

### Option 3: GitHub Pages (Free)

1. Push to GitHub repository
2. Settings → Pages → Deploy from main branch
3. Access at `yourusername.github.io/repo-name`

### Option 4: Any Web Host

Upload all files via FTP to your hosting provider.

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

Email: hello@omotra.co.uk
