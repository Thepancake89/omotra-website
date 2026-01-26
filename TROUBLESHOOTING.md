# Troubleshooting Guide

## Animated Logo Not Displaying/Animating

### Issue
The animated logo (`logo-animated.gif`) is not animating in the footer.

### Cause
The `images/logo-animated.gif` file is currently empty (0 bytes). It was created as a placeholder file.

### Solution
1. Replace `images/logo-animated.gif` with your actual animated GIF file
2. Ensure the GIF has a transparent background
3. Recommended size: 200x200px or similar square dimensions
4. The file should be optimized for web (under 500KB recommended)

### Verification
After adding the file, check:
- File size should be > 0 bytes
- File should display and animate in browser
- Check browser console for any 404 errors

---

## Contact Form Not Sending Emails

### Issue
Contact form submissions are not sending emails via Resend.

### Possible Causes & Solutions

#### 1. Environment Variables Not Set in Vercel
The contact form requires these environment variables in your Vercel project:

- `RESEND_API_KEY` - Your Resend API key
- `RESEND_FROM_EMAIL` - Verified sender email (e.g., `noreply@yourdomain.com`)
- `CONTACT_EMAIL` - Recipient email (e.g., `build@omotra.com`)

**Solution:**
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all three variables
4. Redeploy your project

#### 2. Resend API Key Issues
- Verify your Resend API key is valid
- Check that the API key has proper permissions
- Ensure you're using the correct API key (not a test key if in production)

#### 3. Email Domain Not Verified in Resend
- The `RESEND_FROM_EMAIL` domain must be verified in Resend dashboard
- Check Resend dashboard → Domains
- Verify DNS records are correctly set

#### 4. Serverless Function Not Deployed
- Ensure `api/contact.js` is properly deployed
- Check Vercel Functions tab for any errors
- Verify the function is accessible at `/api/contact`

#### 5. CORS Issues
- Check browser console for CORS errors
- Verify the API endpoint is accessible from your domain

### Debugging Steps

1. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Submit the form
   - Check the `/api/contact` request
   - Look for error messages in the response

2. **Check Vercel Function Logs:**
   - Go to Vercel dashboard → Your Project → Functions
   - Click on `api/contact.js`
   - Check the logs for errors
   - Look for environment variable warnings

3. **Test Environment Variables:**
   ```javascript
   // Add this temporarily to api/contact.js to debug
   console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
   console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
   console.log('CONTACT_EMAIL:', process.env.CONTACT_EMAIL);
   ```

4. **Test Resend API Directly:**
   - Use Resend's API testing tool
   - Verify your API key works
   - Check if emails are being sent but going to spam

### Common Error Messages

- **"Server configuration error"** → Environment variables missing
- **"Failed to send email"** → Resend API issue (check API key and domain verification)
- **"Network error"** → Function not deployed or CORS issue
- **429 Error** → Rate limit exceeded (too many submissions)

### Quick Fix Checklist

- [ ] Environment variables set in Vercel dashboard
- [ ] Resend API key is valid and active
- [ ] Email domain verified in Resend
- [ ] Serverless function deployed successfully
- [ ] No errors in Vercel function logs
- [ ] Check spam folder for test emails
