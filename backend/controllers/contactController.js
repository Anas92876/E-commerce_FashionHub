const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your email service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
    },
  });
};

// Beautiful HTML email template
const getEmailTemplate = (contactData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Message</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 36px;
          color: #ffffff;
          font-weight: bold;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .logo-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #ffffff;
          font-size: 16px;
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .title {
          color: #2c3e50;
          font-size: 24px;
          margin: 0 0 20px 0;
          font-weight: 600;
        }
        .info-box {
          background-color: #f8f9fa;
          border-left: 4px solid #1abc9c;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-row {
          margin: 15px 0;
        }
        .info-label {
          color: #7f8c8d;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .info-value {
          color: #2c3e50;
          font-size: 16px;
          word-break: break-word;
        }
        .message-box {
          background-color: #ffffff;
          border: 2px solid #ecf0f1;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .message-text {
          color: #34495e;
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
        }
        .footer {
          background-color: #2c3e50;
          padding: 30px;
          text-align: center;
        }
        .footer-text {
          color: #ecf0f1;
          font-size: 14px;
          margin: 5px 0;
        }
        .footer-link {
          color: #1abc9c;
          text-decoration: none;
        }
        .divider {
          height: 1px;
          background-color: #ecf0f1;
          margin: 20px 0;
        }
        .badge {
          display: inline-block;
          background-color: #e74c3c;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <span class="logo-icon">🐍</span>
          <h1 class="logo">COBRA</h1>
          <p class="subtitle">New Contact Message Received</p>
        </div>

        <!-- Content -->
        <div class="content">
          <h2 class="title">
            <span class="badge">NEW</span> Contact Form Submission
          </h2>

          <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 25px;">
            You have received a new message from your Cobra website contact form.
          </p>

          <!-- Contact Information -->
          <div class="info-box">
            <div class="info-row">
              <div class="info-label">👤 Name</div>
              <div class="info-value">${contactData.name}</div>
            </div>

            <div class="divider"></div>

            <div class="info-row">
              <div class="info-label">✉️ Email</div>
              <div class="info-value">
                <a href="mailto:${contactData.email}" style="color: #1abc9c; text-decoration: none;">
                  ${contactData.email}
                </a>
              </div>
            </div>

            ${contactData.phone ? `
              <div class="divider"></div>
              <div class="info-row">
                <div class="info-label">📞 Phone</div>
                <div class="info-value">${contactData.phone}</div>
              </div>
            ` : ''}

            <div class="divider"></div>

            <div class="info-row">
              <div class="info-label">📋 Subject</div>
              <div class="info-value"><strong>${contactData.subject}</strong></div>
            </div>
          </div>

          <!-- Message -->
          <div class="info-label" style="margin-bottom: 10px;">💬 Message</div>
          <div class="message-box">
            <p class="message-text">${contactData.message}</p>
          </div>

          <p style="color: #7f8c8d; font-size: 13px; margin-top: 25px;">
            <strong>Received:</strong> ${new Date().toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p class="footer-text"><strong>Cobra</strong> - Fashion E-Commerce</p>
          <p class="footer-text">
            This is an automated notification from your website contact form.
          </p>
          <p class="footer-text">
            © ${new Date().getFullYear()} Cobra. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, phone, subject, message } = req.body;

    // Create contact in database
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    // Send email notification
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"Cobra Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Your email to receive messages
        subject: `🐍 New Contact: ${subject}`,
        html: getEmailTemplate({ name, email, phone, subject, message }),
        replyTo: email, // Allow direct reply to the sender
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      data: contact,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages',
    });
  }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Mark as read
    if (!contact.isRead) {
      contact.isRead = true;
      await contact.save();
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve message',
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
exports.updateContactStatus = async (req, res) => {
  try {
    const { status, isRead } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    if (status) contact.status = status;
    if (typeof isRead !== 'undefined') contact.isRead = isRead;

    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
    });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
    });
  }
};

// @desc    Reply to contact message
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
exports.replyToContact = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: to, subject, message',
      });
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Send reply email
    const transporter = createTransporter();

    const replyTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            font-size: 36px;
            color: #ffffff;
            font-weight: bold;
            margin: 0;
          }
          .logo-icon {
            font-size: 48px;
            display: block;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 30px;
          }
          .message-text {
            color: #34495e;
            font-size: 15px;
            line-height: 1.6;
            white-space: pre-wrap;
          }
          .footer {
            background-color: #2c3e50;
            padding: 30px;
            text-align: center;
          }
          .footer-text {
            color: #ecf0f1;
            font-size: 14px;
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <span class="logo-icon">🐍</span>
            <h1 class="logo">COBRA</h1>
          </div>
          <div class="content">
            <p class="message-text">${message}</p>
          </div>
          <div class="footer">
            <p class="footer-text"><strong>Cobra</strong> - Fashion E-Commerce</p>
            <p class="footer-text">© ${new Date().getFullYear()} Cobra. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Cobra Support" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: replyTemplate,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
    });
  } catch (error) {
    console.error('Reply to contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send reply',
    });
  }
};
