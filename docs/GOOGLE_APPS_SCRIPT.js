/**
 * ===========================================
 * Omotra Contact Form — Google Apps Script
 * ===========================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Paste this entire code
 * 4. Update the CONFIG section below with your details
 * 5. Click Deploy → New deployment
 * 6. Select "Web app"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone"
 * 9. Click Deploy and authorize
 * 10. Copy the Web App URL and paste it in main.js
 * 
 * OPTIONAL: Create a Google Sheet and add its ID below
 * to log all submissions for backup/tracking.
 */

// ===========================================
// CONFIGURATION — UPDATE THESE VALUES
// ===========================================

var CONFIG = {
  // Email address to receive form submissions
  RECIPIENT_EMAIL: 'build@omotra.co.uk',
  
  // Your company name (used in email subject)
  COMPANY_NAME: 'Omotra',
  
  // Google Sheet ID for logging (optional - leave empty to disable)
  // Find this in your Sheet URL: docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
  SPREADSHEET_ID: '',
  
  // Sheet name for logging
  SHEET_NAME: 'Submissions',
  
  // reCAPTCHA v3 Secret Key (get from Google reCAPTCHA admin console)
  // Leave empty to disable reCAPTCHA verification
  RECAPTCHA_SECRET_KEY: '',
  
  // Minimum reCAPTCHA score (0.0 to 1.0, recommended: 0.5)
  RECAPTCHA_MIN_SCORE: 0.5
};

// ===========================================
// ENQUIRY TYPE LABELS (for email readability)
// ===========================================

var ENQUIRY_TYPES = {
  'website': 'Website Build',
  'automation': 'Automation / Business Flow',
  'both': 'Website + Automation',
  'general': 'General Enquiry'
};

// ===========================================
// MAIN HANDLER — DO NOT MODIFY
// ===========================================

/**
 * Handles POST requests from the contact form
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.name || !data.email || !data.message || !data.enquiryType) {
      return createResponse(false, 'Missing required fields');
    }
    
    // Verify reCAPTCHA if configured
    if (CONFIG.RECAPTCHA_SECRET_KEY && data.recaptchaToken) {
      var recaptchaResult = verifyRecaptcha(data.recaptchaToken);
      if (!recaptchaResult.success || recaptchaResult.score < CONFIG.RECAPTCHA_MIN_SCORE) {
        Logger.log('reCAPTCHA failed: score=' + recaptchaResult.score);
        // Silently fail to not alert bots
        return createResponse(true, 'Form submitted successfully');
      }
    }
    
    // Send email notification
    sendNotificationEmail(data);
    
    // Log to spreadsheet if configured
    if (CONFIG.SPREADSHEET_ID) {
      logToSpreadsheet(data);
    }
    
    return createResponse(true, 'Form submitted successfully');
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createResponse(false, error.toString());
  }
}

/**
 * Verifies reCAPTCHA v3 token with Google
 */
function verifyRecaptcha(token) {
  try {
    var url = 'https://www.google.com/recaptcha/api/siteverify';
    var payload = {
      secret: CONFIG.RECAPTCHA_SECRET_KEY,
      response: token
    };
    
    var options = {
      method: 'post',
      payload: payload
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var result = JSON.parse(response.getContentText());
    
    return {
      success: result.success,
      score: result.score || 0,
      action: result.action
    };
  } catch (error) {
    Logger.log('reCAPTCHA verification error: ' + error.toString());
    return { success: false, score: 0 };
  }
}

/**
 * Handles GET requests (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    'Omotra Contact Form API is running. Use POST to submit forms.'
  );
}

// ===========================================
// EMAIL FUNCTIONS
// ===========================================

/**
 * Sends notification email with AI-parseable headers
 */
function sendNotificationEmail(data) {
  var enquiryTypeLabel = ENQUIRY_TYPES[data.enquiryType] || data.enquiryType;
  var enquiryTypeTag = data.enquiryType.toUpperCase();
  
  // Create subject line with tags for AI parsing
  // Format: [OMOTRA-ENQUIRY][TYPE:AUTOMATION] New Lead - Company Name
  var subject = '[OMOTRA-ENQUIRY][TYPE:' + enquiryTypeTag + '] New Lead';
  if (data.company) {
    subject += ' - ' + data.company;
  } else {
    subject += ' - ' + data.name;
  }
  
  // Build email body with structured data
  var body = buildEmailBody(data, enquiryTypeLabel);
  
  // Build HTML version for better readability
  var htmlBody = buildHtmlEmailBody(data, enquiryTypeLabel, enquiryTypeTag);
  
  // Send the email
  GmailApp.sendEmail(
    CONFIG.RECIPIENT_EMAIL,
    subject,
    body,
    {
      name: CONFIG.COMPANY_NAME + ' Website',
      htmlBody: htmlBody,
      replyTo: data.email
    }
  );
}

/**
 * Builds plain text email body
 */
function buildEmailBody(data, enquiryTypeLabel) {
  var lines = [
    '═══════════════════════════════════════════',
    'NEW ENQUIRY — ' + enquiryTypeLabel.toUpperCase(),
    '═══════════════════════════════════════════',
    '',
    '--- CONTACT DETAILS ---',
    'Name: ' + data.name,
    'Email: ' + data.email,
    'Company: ' + (data.company || 'Not provided'),
    '',
    '--- ENQUIRY DETAILS ---',
    'Type: ' + enquiryTypeLabel,
    'Budget: ' + formatBudget(data.budget),
    '',
    '--- MESSAGE ---',
    data.message,
    '',
    '═══════════════════════════════════════════',
    '--- METADATA (FOR AI PROCESSING) ---',
    'X-Omotra-Type: ' + data.enquiryType,
    'X-Omotra-Timestamp: ' + data.timestamp,
    'X-Omotra-Source: ' + data.source,
    '═══════════════════════════════════════════'
  ];
  
  return lines.join('\n');
}

/**
 * Builds HTML email body for better readability
 */
function buildHtmlEmailBody(data, enquiryTypeLabel, enquiryTypeTag) {
  var typeColor = getTypeColor(data.enquiryType);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0A3D42; color: #FAF8F5; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 18px; }
    .type-badge { display: inline-block; background: ${typeColor}; color: white; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; border-top: none; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 8px; letter-spacing: 0.5px; }
    .field { margin-bottom: 8px; }
    .field-label { font-weight: 600; color: #333; }
    .message-box { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; white-space: pre-wrap; }
    .metadata { background: #1a1a1a; color: #888; padding: 15px; border-radius: 0 0 8px 8px; font-family: monospace; font-size: 11px; }
    .metadata-title { color: #E07A5F; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Enquiry from ${escapeHtml(data.name)}</h1>
      <span class="type-badge">${escapeHtml(enquiryTypeLabel)}</span>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Contact Details</div>
        <div class="field"><span class="field-label">Name:</span> ${escapeHtml(data.name)}</div>
        <div class="field"><span class="field-label">Email:</span> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>
        <div class="field"><span class="field-label">Company:</span> ${escapeHtml(data.company || 'Not provided')}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Enquiry Details</div>
        <div class="field"><span class="field-label">Type:</span> ${escapeHtml(enquiryTypeLabel)}</div>
        <div class="field"><span class="field-label">Budget:</span> ${escapeHtml(formatBudget(data.budget))}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Message</div>
        <div class="message-box">${escapeHtml(data.message)}</div>
      </div>
    </div>
    
    <div class="metadata">
      <div class="metadata-title">// AI PROCESSING METADATA</div>
      X-Omotra-Type: ${data.enquiryType}<br>
      X-Omotra-Timestamp: ${data.timestamp}<br>
      X-Omotra-Source: ${data.source}<br>
      X-Omotra-Budget: ${data.budget || 'not-specified'}
    </div>
  </div>
</body>
</html>`;
}

// ===========================================
// SPREADSHEET LOGGING
// ===========================================

/**
 * Logs submission to Google Sheets
 */
function logToSpreadsheet(data) {
  try {
    var sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                              .getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      // Create sheet if it doesn't exist
      sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                            .insertSheet(CONFIG.SHEET_NAME);
      
      // Add headers
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Email',
        'Company',
        'Enquiry Type',
        'Budget',
        'Message',
        'Source',
        'Status'
      ]);
      
      // Format header row
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    }
    
    // Append the data
    sheet.appendRow([
      new Date(data.timestamp),
      data.name,
      data.email,
      data.company || '',
      ENQUIRY_TYPES[data.enquiryType] || data.enquiryType,
      formatBudget(data.budget),
      data.message,
      data.source,
      'New'
    ]);
    
  } catch (error) {
    Logger.log('Spreadsheet logging error: ' + error.toString());
    // Don't throw - email was already sent, logging is optional
  }
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Creates a JSON response
 */
function createResponse(success, message) {
  return ContentService.createTextOutput(
    JSON.stringify({ success: success, message: message })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Formats budget value for display
 */
function formatBudget(budget) {
  var budgetLabels = {
    'under-2k': 'Under £2,000',
    '2k-5k': '£2,000 - £5,000',
    '5k-10k': '£5,000 - £10,000',
    '10k-20k': '£10,000 - £20,000',
    '20k+': '£20,000+',
    'not-sure': 'Not sure yet'
  };
  
  return budgetLabels[budget] || 'Not specified';
}

/**
 * Gets color for enquiry type badge
 */
function getTypeColor(enquiryType) {
  var colors = {
    'website': '#0F5C63',
    'automation': '#E07A5F',
    'both': '#8B5CF6',
    'general': '#6B7280'
  };
  
  return colors[enquiryType] || '#6B7280';
}

/**
 * Escapes HTML entities
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===========================================
// TEST FUNCTION
// ===========================================

/**
 * Test the email sending (run this manually to test)
 */
function testEmail() {
  var testData = {
    name: 'Test User',
    email: 'test@example.com',
    company: 'Test Company Ltd',
    enquiryType: 'automation',
    budget: '5k-10k',
    message: 'This is a test enquiry about building an automation workflow for our sales process.',
    timestamp: new Date().toISOString(),
    source: 'https://omotra.co.uk/contact.html'
  };
  
  sendNotificationEmail(testData);
  Logger.log('Test email sent to: ' + CONFIG.RECIPIENT_EMAIL);
}

