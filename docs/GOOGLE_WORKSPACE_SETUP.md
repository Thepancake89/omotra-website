# Google Workspace Integration Setup Guide

This guide will help you connect the Omotra contact form to your Google Workspace account.

---

## Overview

When a visitor submits the contact form:

1. Form data is sent to Google Apps Script
2. Apps Script sends you a formatted email with AI-parseable headers
3. Optionally logs to Google Sheets for tracking
4. Your AI agents can scrape emails by the `[OMOTRA-ENQUIRY]` tag

---

## Step 1: Create the Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **New project**
3. Delete any existing code in the editor
4. Copy the entire contents of `GOOGLE_APPS_SCRIPT.js` and paste it in
5. Rename the project to "Omotra Contact Form" (click "Untitled project" at the top)

---

## Step 2: Configure Your Settings

In the script, find the `CONFIG` section and update:

```javascript
var CONFIG = {
  // Your email address for receiving submissions
  RECIPIENT_EMAIL: 'build@omotra.co.uk',
  
  // Your company name
  COMPANY_NAME: 'Omotra',
  
  // Optional: Google Sheet ID for logging
  SPREADSHEET_ID: '',
  
  // Sheet tab name
  SHEET_NAME: 'Submissions',
  
  // reCAPTCHA v3 Secret Key (optional but recommended)
  RECAPTCHA_SECRET_KEY: '',
  
  // Minimum reCAPTCHA score (0.0 to 1.0)
  RECAPTCHA_MIN_SCORE: 0.5
};
```

---

## Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Configure:
   - **Description**: "Contact Form Handler v1"
   - **Execute as**: "Me (your email)"
   - **Who has access**: "Anyone"
4. Click **Deploy**
5. Click **Authorize access** and follow the prompts
   - If you see "This app isn't verified", click "Advanced" → "Go to Omotra Contact Form (unsafe)"
   - Review and click "Allow"
6. **Copy the Web App URL** (looks like `https://script.google.com/macros/s/xxxxx/exec`)

---

## Step 4: Update Your Website

Open `js/main.js` and find this line near the top of the Contact Form section:

```javascript
var GOOGLE_APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```

Replace it with your Web App URL:

```javascript
var GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID_HERE/exec';
```

---

## Step 5: Test the Integration

1. Open your website's contact form
2. Fill in test data and submit
3. Check your email for the notification
4. If you set up Sheets logging, check the spreadsheet

---

## Optional: Set Up Google Sheets Logging

To keep a backup of all submissions:

1. Create a new Google Sheet
2. Copy the Sheet ID from the URL:
   - URL: `https://docs.google.com/spreadsheets/d/`**`1ABC123xyz...`**`/edit`
   - ID: `1ABC123xyz...`
3. Paste the ID into the `SPREADSHEET_ID` config in Apps Script
4. Re-deploy the script (Deploy → Manage deployments → Edit → New version → Deploy)

The script will automatically create a "Submissions" tab with headers.

---

## Email Format for AI Agents

Your AI agents should filter emails by:

### Subject Line Pattern
```
[OMOTRA-ENQUIRY][TYPE:WEBSITE] New Lead - Company Name
[OMOTRA-ENQUIRY][TYPE:AUTOMATION] New Lead - Company Name
[OMOTRA-ENQUIRY][TYPE:BOTH] New Lead - Company Name
[OMOTRA-ENQUIRY][TYPE:GENERAL] New Lead - Company Name
```

### Metadata in Email Body
```
X-Omotra-Type: website | automation | both | general
X-Omotra-Timestamp: 2026-01-05T14:30:00.000Z
X-Omotra-Source: https://omotra.co.uk/contact.html
X-Omotra-Budget: under-2k | 2k-5k | 5k-10k | 10k-20k | 20k+ | not-sure
```

### AI Agent Filter Example (Gmail)
```
subject:[OMOTRA-ENQUIRY][TYPE:AUTOMATION] OR subject:[OMOTRA-ENQUIRY][TYPE:BOTH]
```

This will catch all automation-related enquiries for your AI to process.

---

## Troubleshooting

### Form submits but no email received
- Check the Apps Script execution logs: **View → Executions**
- Verify the recipient email is correct
- Check spam folder
- Make sure you authorized the app

### "Error" message on form submission
- Check browser console for errors
- Verify the Apps Script URL is correct
- Make sure the deployment is set to "Anyone" can access

### Apps Script shows "Exceeded maximum execution time"
- This shouldn't happen with a simple form, but if it does, check if Sheets logging is failing

### Need to update the script
1. Make your changes in Apps Script
2. Click **Deploy** → **Manage deployments**
3. Click the pencil icon to edit
4. Change version to **New version**
5. Click **Deploy**

---

## Security Notes

- The Apps Script runs under your Google account
- Form data is only sent to your Gmail and optionally your Sheet
- The honeypot field helps prevent spam bots
- Time-based validation blocks submissions under 3 seconds
- No data is stored by third parties

---

## Optional: Set Up reCAPTCHA v3 (Recommended)

reCAPTCHA v3 provides invisible spam protection without user interaction.

### Step 1: Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Click **+ Create**
3. Fill in:
   - **Label**: Omotra Website
   - **reCAPTCHA type**: reCAPTCHA v3
   - **Domains**: omotra.co.uk (add localhost for testing)
4. Accept terms and click **Submit**
5. Copy your **Site Key** and **Secret Key**

### Step 2: Update Your Website

In `contact.html`, find and replace:
```html
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_RECAPTCHA_SITE_KEY"></script>
```

In `js/main.js`, find and replace:
```javascript
var RECAPTCHA_SITE_KEY = 'YOUR_RECAPTCHA_SITE_KEY';
```

### Step 3: Update Apps Script

In the Apps Script `CONFIG` section, add your Secret Key:
```javascript
RECAPTCHA_SECRET_KEY: 'your-secret-key-here',
```

### Step 4: Re-deploy Apps Script

1. Click **Deploy** → **Manage deployments**
2. Click the pencil icon to edit
3. Change version to **New version**
4. Click **Deploy**

---

## Files Modified

| File | Changes |
|------|---------|
| `contact.html` | Added enquiry type dropdown, honeypot field, error message div |
| `js/main.js` | New form handler with Apps Script integration |
| `docs/GOOGLE_APPS_SCRIPT.js` | Apps Script code to copy into Google |
| `docs/GOOGLE_WORKSPACE_SETUP.md` | This setup guide |

