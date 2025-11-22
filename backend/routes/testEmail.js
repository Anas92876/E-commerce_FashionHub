const express = require('express');
const router = express.Router();
const { sendEmail } = require('../config/email');

// Test email endpoint (REMOVE IN PRODUCTION!)
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Send test email
    const result = await sendEmail(
      email,
      'Test Email from Cobra Market',
      'welcomeEmail',
      { firstName: 'Test User' }
    );

    res.json({
      success: result.success,
      message: result.success ? 'Test email sent! Check your inbox and spam folder.' : 'Email sending failed',
      details: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
