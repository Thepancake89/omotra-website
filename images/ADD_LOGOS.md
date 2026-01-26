# Adding Logo Files

## Required Files

### 1. logo-static.png
- **Description:** Static logo with teal "C" shape and orange dot
- **Format:** PNG with transparent background
- **Usage:** Navigation header and footer across all pages
- **Current Status:** ✅ File created (copied from logo.png - may need background removal)

### 2. logo-animated.gif  
- **Description:** Animated logo with teal "O" shape and particle effects
- **Format:** GIF with transparent background
- **Usage:** Hero section on homepage
- **Current Status:** ⚠️ Empty placeholder file - needs actual image

## How to Add Your Images

### Option 1: Replace Files Directly
1. Place your transparent background logo PNG file as `images/logo-static.png`
2. Place your transparent background animated GIF file as `images/logo-animated.gif`

### Option 2: Process Existing Logo
If you want to remove the background from the existing logo.png:
```bash
node scripts/remove-logo-background.js
```
Then copy the processed logo to logo-static.png

## File Requirements
- Both files MUST have transparent backgrounds (no solid color backgrounds)
- logo-static.png: PNG format
- logo-animated.gif: GIF format with animation
- Files should be optimized for web use
