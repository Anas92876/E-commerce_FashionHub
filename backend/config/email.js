const nodemailer = require('nodemailer');

// ===============================
// NODEMAILER TRANSPORTER CONFIGURATION
// ===============================
let transporter = null;

// Initialize SMTP transporter
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify connection
  transporter.verify(function (error, success) {
    if (error) {
      console.log('❌ Email configuration error:', error.message);
      console.log('💡 Make sure you use Gmail App Password, not regular password');
    } else {
      console.log('✅ Email service ready to send emails');
    }
  });
} else {
  console.log('⚠️  Email not configured. Set EMAIL_USER and EMAIL_PASSWORD in environment variables');
}

// ===============================
// EMAIL TEMPLATES
// ===============================
const emailTemplates = {
  // ORDER CONFIRMATION
  orderConfirmation: (data) => {
    const { order, user } = data;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .order-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .order-items { margin: 20px 0; }
        .item { border-bottom: 1px solid #eee; padding: 15px 0; display: flex; justify-content: space-between; }
        .item:last-child { border-bottom: none; }
        .total { font-size: 24px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea; text-align: right; }
        .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for shopping at Cobra Market</p>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <p>We're excited to let you know that your order has been confirmed and is being processed!</p>

          <div class="order-info">
            <p><strong>Order Number:</strong> #${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>

          <div class="order-items">
            <h3>Order Details:</h3>
            ${order.items.map(item => `
              <div class="item">
                <div>
                  <strong>${item.name}</strong><br>
                  <span style="color: #666;">Size: ${item.size} | Quantity: ${item.quantity}</span>
                </div>
                <div style="font-weight: bold;">
                  $${(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="total">
            Total: $${order.totalPrice.toFixed(2)}
          </div>

          <p><strong>Shipping Address:</strong><br>
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
          ${order.shippingAddress.country}</p>

          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br><strong>Cobra Market Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; 2025 Cobra Market. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `},

  // WELCOME EMAIL
  welcomeEmail: (data) => {
    const user = data;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; }
        .content { padding: 30px 20px; }
        .feature-box { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Cobra Market! 🎉</h1>
          <p>We're thrilled to have you join us</p>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <p>Welcome to Cobra Market - your premier destination for quality fashion and exceptional service!</p>

          <h3>What you can do now:</h3>
          <div class="feature-box">
            ✨ Browse our exclusive collection of premium products
          </div>
          <div class="feature-box">
            🛍️ Enjoy personalized shopping recommendations
          </div>
          <div class="feature-box">
            💝 Get access to member-only deals and promotions
          </div>
          <div class="feature-box">
            📦 Track your orders in real-time
          </div>

          <p>If you have any questions, our support team is always here to help!</p>
          <p>Best regards,<br><strong>Cobra Market Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; 2025 Cobra Market. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `},

  // ORDER SHIPPED
  orderShipped: (data) => {
    const { order, user, tracking } = data;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .tracking-box { background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #10b981; margin: 10px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order Has Shipped!</h1>
          <p>Your package is on its way</p>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <p>Great news! Your order #${order._id} has been shipped and is on its way to you.</p>

          <div class="tracking-box">
            <p style="margin: 0; color: #666;">Tracking Number</p>
            <div class="tracking-number">${tracking || 'Will be updated soon'}</div>
          </div>

          <p>Best regards,<br><strong>Cobra Market Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; 2025 Cobra Market. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `},

  // ORDER DELIVERED
  orderDelivered: (data) => {
    const { order, user } = data;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Delivered!</h1>
          <p>Your package has arrived</p>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <p>Your order #${order._id} has been delivered successfully!</p>
          <p>We hope you love your purchase. Your satisfaction is our priority.</p>

          <p>If you have any issues with your order, please don't hesitate to contact us.</p>
          <p>Best regards,<br><strong>Cobra Market Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; 2025 Cobra Market. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `},

  // ORDER CANCELLED
  orderCancelled: (data) => {
    const { order, user, reason } = data;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Cancelled</h1>
          <p>Your order has been cancelled</p>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <p>Your order #${order._id} has been cancelled.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you did not request this cancellation, please contact our support team immediately.</p>
          <p>Best regards,<br><strong>Cobra Market Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; 2025 Cobra Market. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `},
};

// ===============================
// SEND EMAIL FUNCTION
// ===============================
const sendEmail = async (to, subject, templateName, data) => {
  try {
    // Check if email is configured
    if (!transporter) {
      console.log('⚠️  Email not configured. Skipping email send.');
      console.log(`📧 Would have sent: ${subject} to ${to}`);
      return { success: false, error: 'Email not configured' };
    }

    // Get template function
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const html = template(data);

    // Send email
    const info = await transporter.sendMail({
      from: `"Cobra Market" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`✅ Email sent: ${info.messageId} - ${subject} to ${to}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email sending failed:', error.message || error);
    return { success: false, error: error.message || 'Email sending failed' };
  }
};

// ===============================
// EXPORTS
// ===============================
module.exports = { sendEmail, emailTemplates };
