/**
 * Contact Form API Handler
 * Handles form submissions and sends emails via Resend API
 * with rate limiting and spam protection
 */

const { Resend } = require('resend');

function logDebug(payload) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/28dc9884-0142-4dce-a6ef-6c488d95962b', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: payload.runId || 'initial',
      hypothesisId: payload.hypothesisId,
      location: payload.location,
      message: payload.message,
      data: payload.data,
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion
}

// In-memory store for rate limiting
// Key: IP address, Value: { count, resetTime }
const rateLimitStore = new Map();

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check rate limit for given IP address
 * @param {string} ip - Client IP address
 * @returns {object} Rate limit status
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  // No record or window expired - allow and create new record
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  // Within window - check count
  if (record.count >= RATE_LIMIT_MAX) {
    const resetInSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, resetTime: record.resetTime, retryAfter: resetInSeconds };
  }
  
  // Increment count
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

/**
 * Get client IP address from request headers
 * @param {object} req - Request object
 * @returns {string} Client IP address
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.headers['x-real-ip'] || 
         req.socket?.remoteAddress || 
         'unknown';
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate form data
 * @param {object} data - Form data to validate
 * @returns {object} Validation result { valid: boolean, error?: string }
 */
function validateFormData(data) {
  // Check honeypot field - must be empty or missing
  if (data.website && data.website.length > 0) {
    // Silently reject spam (don't alert bot)
    return { valid: false, silent: true };
  }
  
  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  if (data.name.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  if (data.name.length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' };
  }
  
  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  if (!isValidEmail(data.email)) {
    return { valid: false, error: 'Invalid email address format' };
  }
  if (data.email.length > 255) {
    return { valid: false, error: 'Email address is too long' };
  }
  
  // Message validation
  if (!data.message || typeof data.message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }
  if (data.message.length < 10) {
    return { valid: false, error: 'Message must be at least 10 characters' };
  }
  if (data.message.length > 5000) {
    return { valid: false, error: 'Message must be less than 5000 characters' };
  }
  
  // Enquiry type validation
  const validEnquiryTypes = ['website', 'automation', 'both', 'general'];
  if (!data.enquiryType || !validEnquiryTypes.includes(data.enquiryType)) {
    return { valid: false, error: 'Please select a valid enquiry type' };
  }
  
  // Company validation (optional)
  if (data.company && data.company.length > 100) {
    return { valid: false, error: 'Company name must be less than 100 characters' };
  }
  
  // Budget validation (optional)
  const validBudgets = ['under-2k', '2k-5k', '5k-10k', '10k-20k', '20k+', 'not-sure', ''];
  if (data.budget && !validBudgets.includes(data.budget)) {
    return { valid: false, error: 'Please select a valid budget range' };
  }
  
  return { valid: true };
}

/**
 * Format enquiry type for email display
 * @param {string} type - Enquiry type code
 * @returns {string} Formatted enquiry type
 */
function formatEnquiryType(type) {
  const types = {
    'website': 'Website Build',
    'automation': 'Automation / Business Flow',
    'both': 'Website + Automation',
    'general': 'General Enquiry'
  };
  return types[type] || type;
}

/**
 * Format budget for email display
 * @param {string} budget - Budget code
 * @returns {string} Formatted budget
 */
function formatBudget(budget) {
  const budgets = {
    'under-2k': 'Under £2,000',
    '2k-5k': '£2,000 - £5,000',
    '5k-10k': '£5,000 - £10,000',
    '10k-20k': '£10,000 - £20,000',
    '20k+': '£20,000+',
    'not-sure': 'Not sure yet'
  };
  return budgets[budget] || 'Not specified';
}

/**
 * Generate HTML email template
 * @param {object} data - Form data
 * @returns {string} HTML email content
 */
function generateHtmlEmail(data) {
  const enquiryTypeColor = {
    'website': '#1A7A82',
    'automation': '#E07A5F',
    'both': '#0A3D42',
    'general': '#666'
  };
  
  const color = enquiryTypeColor[data.enquiryType] || '#666';
  
  const safeName = escapeHtml(String(data.name || ''));
  const safeEmail = escapeHtml(String(data.email || ''));
  const safeCompany = escapeHtml(String(data.company || ''));
  const safeMessageHtml = escapeHtml(String(data.message || '')).replace(/\n/g, '<br>');
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0A3D42; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px 20px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .field-value { font-size: 16px; color: #333; }
    .badge { display: inline-block; padding: 6px 12px; background: ${color}; color: white; border-radius: 4px; font-size: 14px; font-weight: 500; }
    .message-box { background: white; border-left: 4px solid #E07A5F; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { background: #333; color: #aaa; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Form Submission</h1>
    </div>
    
    <div class="content">
      <div class="field">
        <div class="field-label">Name</div>
        <div class="field-value">${safeName}</div>
      </div>
      
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value"><a href="mailto:${safeEmail}">${safeEmail}</a></div>
      </div>
      
      ${data.company ? `
      <div class="field">
        <div class="field-label">Company</div>
        <div class="field-value">${safeCompany}</div>
      </div>
      ` : ''}
      
      <div class="field">
        <div class="field-label">Enquiry Type</div>
        <div class="field-value"><span class="badge">${formatEnquiryType(data.enquiryType)}</span></div>
      </div>
      
      ${data.budget ? `
      <div class="field">
        <div class="field-label">Budget Range</div>
        <div class="field-value">${formatBudget(data.budget)}</div>
      </div>
      ` : ''}
      
      <div class="field">
        <div class="field-label">Message</div>
        <div class="message-box">
          ${safeMessageHtml}
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>Submitted: ${new Date(data.timestamp || Date.now()).toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
      ${data.source ? `<p>From: ${data.source}</p>` : ''}
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML characters to prevent injection in email templates
 * @param {string} value - Raw string value
 * @returns {string} Escaped value
 */
function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate plain text email
 * @param {object} data - Form data
 * @returns {string} Plain text email content
 */
function generateTextEmail(data) {
  return `
OMOTRA CONTACT FORM SUBMISSION

Name: ${data.name}
Email: ${data.email}
${data.company ? `Company: ${data.company}` : ''}
Enquiry Type: ${formatEnquiryType(data.enquiryType)}
${data.budget ? `Budget: ${formatBudget(data.budget)}` : ''}

MESSAGE:
${data.message}

---
Submitted: ${new Date(data.timestamp || Date.now()).toLocaleString('en-GB', { timeZone: 'Europe/London' })}
${data.source ? `From: ${data.source}` : ''}
  `.trim();
}

/**
 * Main handler function
 */
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
  
  try {
    // Load environment variables
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
    const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
    logDebug({
      runId: 'initial',
      hypothesisId: 'H1',
      location: 'api/contact.js:handler',
      message: 'Env var presence check',
      data: {
        hasResendApiKey: Boolean(RESEND_API_KEY),
        hasResendFromEmail: Boolean(RESEND_FROM_EMAIL),
        hasContactEmail: Boolean(CONTACT_EMAIL)
      }
    });
    
    // Validate environment variables are set
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL || !CONTACT_EMAIL) {
      console.error('Missing required environment variables');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }
    
    // Get client IP for rate limiting
    const clientIp = getClientIp(req);
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIp);
    logDebug({
      runId: 'initial',
      hypothesisId: 'H4',
      location: 'api/contact.js:handler',
      message: 'Rate limit evaluation',
      data: {
        allowed: rateLimit.allowed,
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime || null,
        hasClientIp: Boolean(clientIp)
      }
    });
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return res.status(429).json({
        success: false,
        error: 'Too many submissions. Please try again later.',
        retryAfter: rateLimit.retryAfter
      });
    }
    
    // Parse request body
    let formData = req.body;
    if (typeof formData === 'string') {
      try {
        formData = JSON.parse(formData);
      } catch (parseErr) {
        console.error('Invalid JSON payload', parseErr);
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON payload'
        });
      }
    }
    if (!formData || typeof formData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body'
      });
    }
    logDebug({
      runId: 'initial',
      hypothesisId: 'H2',
      location: 'api/contact.js:handler',
      message: 'Incoming payload snapshot',
      data: {
        keys: Object.keys(formData || []),
        nameLength: formData?.name?.length || 0,
        messageLength: formData?.message?.length || 0
      }
    });
    
    // Validate form data
    const validation = validateFormData(formData);
    logDebug({
      runId: 'initial',
      hypothesisId: 'H2',
      location: 'api/contact.js:handler',
      message: 'Validation result',
      data: {
        valid: validation.valid,
        error: validation.error || null,
        silent: validation.silent || false
      }
    });
    if (!validation.valid) {
      // Silent rejection for honeypot spam
      if (validation.silent) {
        return res.status(200).json({
          success: true,
          message: 'Email sent successfully'
        });
      }
      
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }
    
    // Initialize Resend
    const resend = new Resend(RESEND_API_KEY);
    
    // Send email
    const { data: sendResult, error: sendError } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: CONTACT_EMAIL,
      reply_to: formData.email,
      subject: `[Omotra Contact] New enquiry from ${formData.name}`,
      html: generateHtmlEmail(formData),
      text: generateTextEmail(formData)
    });
    logDebug({
      runId: 'initial',
      hypothesisId: 'H3',
      location: 'api/contact.js:handler',
      message: 'Resend send result',
      data: {
        hasSendError: Boolean(sendError),
        sendErrorMessage: sendError?.message || null,
        sendResultId: sendResult?.id || null
      }
    });
    
    if (sendError) {
      console.error('Resend API error:', sendError);
      return res.status(500).json({
        success: false,
        error: sendError?.message || 'Failed to send email'
      });
    }
    
    if (!sendResult?.id) {
      console.error('Resend API error: Missing email id in response');
      return res.status(500).json({
        success: false,
        error: 'Failed to send email'
      });
    }
    console.log(`Email sent successfully to ${CONTACT_EMAIL} from ${formData.email}`);
    
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });
    
  } catch (error) {
    logDebug({
      runId: 'initial',
      hypothesisId: 'H5',
      location: 'api/contact.js:handler',
      message: 'Unhandled error',
      data: { errorMessage: error?.message || 'unknown', errorName: error?.name || 'Error' }
    });
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request'
    });
  }
}

