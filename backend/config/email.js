const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const sgMail = require('@sendgrid/mail');
const SibApiV3Sdk = require('@sendinblue/client');

// ===============================
// EMAIL SERVICE DETECTION
// ===============================
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'smtp'; // 'brevo', 'sendgrid', 'resend', or 'smtp'
let resendClient = null;
let transporter = null;
let sendgridConfigured = false;
let brevoClient = null;

// Initialize Brevo (formerly Sendinblue - BEST FREE TIER!)
if (EMAIL_SERVICE === 'brevo' && process.env.BREVO_API_KEY) {
  brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
  const apiKey = brevoClient.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  console.log('📧 Email service: Brevo (300 emails/day FREE, no domain required)');
}
// Initialize SendGrid (no domain required!)
else if (EMAIL_SERVICE === 'sendgrid' && process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  sendgridConfigured = true;
  console.log('📧 Email service: SendGrid (no domain required)');
}
// Initialize Resend
else if (EMAIL_SERVICE === 'resend' && process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
  console.log('📧 Email service: Resend (recommended for Railway)');
}
// Initialize SMTP (Gmail, etc.)
else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log('❌ SMTP Email error:', error.message);
      console.log('💡 TIP: Railway may block SMTP. Consider using Brevo or SendGrid instead.');
    } else {
      console.log('✅ SMTP Email server is ready');
    }
  });
  console.log('📧 Email service: SMTP');
} else {
  console.log('⚠️  No email service configured. Set BREVO_API_KEY (recommended), SENDGRID_API_KEY, RESEND_API_KEY, or EMAIL_USER/EMAIL_PASSWORD');
}

// ===============================
// EMAIL TEMPLATES (FIXED)
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
            <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery || '3-5 business days'}</p>
          </div>

          <div class="order-items">
            <h3>Order Details:</h3>
            ${order.items.map(item => `
              <div class="item">
                <div>
                  <strong>${item.name}</strong><br>
                  <span style="color: #666;">Quantity: ${item.quantity}</span>
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
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}" class="button">Track Your Order</a>
          </center>

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
        .button { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
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
            <div class="tracking-number">${tracking || 'N/A'}</div>
            <p style="margin: 10px 0 0 0; color: #666;">Estimated Delivery: ${order.estimatedDelivery || '3-5 business days'}</p>
          </div>

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}" class="button">Track Your Package</a>
          </center>

          <p><strong>Shipping Address:</strong><br>
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>

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
        .button { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
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

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products/${order.items[0]?.product}/review" class="button">Leave a Review</a>
          </center>

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
        .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
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
          <p>Any payments made will be refunded within 5-7 business days.</p>

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="button">Continue Shopping</a>
          </center>

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
        .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
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

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="button">Start Shopping</a>
          </center>

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

  // PASSWORD RESET
  passwordReset: (data) => {
    const { user, resetLink } = data;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <p>We received a request to reset your password for your Cobra Market account.</p>

          <center>
            <a href="${resetLink}" class="button">Reset Password</a>
          </center>

          <div class="warning-box">
            <strong>⚠️ Security Note:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact our support team.
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

  // ABANDONED CART
  abandonedCart: (data) => {
    const { cart, user, discountCode } = data;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .cart-items { margin: 20px 0; }
        .item { border-bottom: 1px solid #eee; padding: 15px 0; display: flex; align-items: center; }
        .discount-box { background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .discount-code { font-size: 24px; font-weight: bold; color: #db2777; margin: 10px 0; }
        .button { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 You Left Something Behind!</h1>
          <p>Your cart is waiting for you</p>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <p>We noticed you left some items in your cart. Don't worry, we saved them for you!</p>

          <div class="cart-items">
            ${cart.items.map(item => `
              <div class="item">
                <div style="flex: 1;">
                  <strong>${item.name}</strong><br>
                  <span style="color: #666;">Quantity: ${item.quantity}</span>
                </div>
                <div style="font-weight: bold;">
                  $${(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            `).join('')}
          </div>

          ${discountCode ? `
            <div class="discount-box">
              <p style="margin: 0;">Complete your purchase now and save 10%!</p>
              <div class="discount-code">${discountCode}</div>
              <p style="margin: 0; font-size: 14px; color: #666;">Use this code at checkout</p>
            </div>
          ` : ''}

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart" class="button">Complete Your Purchase</a>
          </center>

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

  // PRICE DROP ALERT
  priceDropAlert: (data) => {
    const { product, user, oldPrice, newPrice } = data;
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
        .price-box { background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .old-price { text-decoration: line-through; color: #999; font-size: 18px; }
        .new-price { font-size: 32px; font-weight: bold; color: #10b981; margin: 10px 0; }
        .savings { color: #059669; font-weight: bold; }
        .button { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Price Drop Alert!</h1>
          <p>The item you wanted is now on sale</p>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <p>Great news! The price has dropped on an item from your wishlist:</p>

          <h3>${product.name}</h3>

          <div class="price-box">
            <div class="old-price">Was: $${oldPrice.toFixed(2)}</div>
            <div class="new-price">Now: $${newPrice.toFixed(2)}</div>
            <div class="savings">Save $${(oldPrice - newPrice).toFixed(2)} (${Math.round(((oldPrice - newPrice) / oldPrice) * 100)}% off)!</div>
          </div>

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products/${product._id}" class="button">Get It Now</a>
          </center>

          <p>Hurry! This price won't last forever.</p>
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

  // BACK IN STOCK
  backInStock: (data) => {
    const { product, user } = data;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .button { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎊 Back in Stock!</h1>
          <p>The item you wanted is available again</p>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <p>Good news! An item from your wishlist is back in stock:</p>

          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p style="font-size: 24px; font-weight: bold; color: #3b82f6;">$${product.price.toFixed(2)}</p>

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products/${product._id}" class="button">Shop Now</a>
          </center>

          <p>Get it before it's gone again!</p>
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

  // REVIEW REQUEST
  reviewRequest: (data) => {
    const { order, user } = data;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .button { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⭐ How Was Your Experience?</h1>
          <p>We'd love to hear your feedback</p>
        </div>
        <div class="content">
          <p>Hi ${user.firstName},</p>
          <p>Thank you for your recent purchase! We hope you're enjoying your new items.</p>
          <p>Your feedback helps us improve and helps other customers make informed decisions.</p>

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}/review" class="button">Leave a Review</a>
          </center>

          <p>Thank you for choosing Cobra Market!</p>
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
// SEND EMAIL FUNCTION (MULTI-SERVICE SUPPORT)
// ===============================
const sendEmail = async (to, subject, templateName, data) => {
  try {
    // Check if any email service is configured
    if (!brevoClient && !sendgridConfigured && !resendClient && !transporter) {
      console.log('⚠️  No email service configured. Skipping email send.');
      console.log(`📧 Would have sent: ${subject} to ${to}`);
      console.log('💡 Set BREVO_API_KEY (recommended - 300/day free), SENDGRID_API_KEY, RESEND_API_KEY, or EMAIL_USER/EMAIL_PASSWORD');
      return { success: false, error: 'Email not configured' };
    }

    // Get template function
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const html = template(data);
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@cobramarket.com';

    // BREVO (BEST - 300 emails/day, no domain required!)
    if (brevoClient) {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.sender = { name: 'Cobra Market', email: fromEmail };
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;

      const result = await brevoClient.sendTransacEmail(sendSmtpEmail);

      console.log('📧 Brevo API Response:', JSON.stringify(result, null, 2));
      console.log(`✅ Email sent via Brevo: ${result.messageId || 'Sent'} - ${subject} to ${to}`);
      return { success: true, messageId: result.messageId };
    }
    // SENDGRID
    else if (sendgridConfigured) {
      const msg = {
        to: to,
        from: fromEmail,
        subject: subject,
        html: html,
      };

      const result = await sgMail.send(msg);

      console.log('📧 SendGrid API Response:', JSON.stringify(result[0], null, 2));
      console.log(`✅ Email sent via SendGrid: ${result[0].headers['x-message-id'] || 'Sent'} - ${subject} to ${to}`);
      return { success: true, messageId: result[0].headers['x-message-id'], statusCode: result[0].statusCode };
    }
    // RESEND
    else if (resendClient) {
      const result = await resendClient.emails.send({
        from: `Cobra Market <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: html,
      });

      console.log('📧 Resend API Response:', JSON.stringify(result, null, 2));
      console.log(`✅ Email sent via Resend: ${result.id || result.data?.id || 'ID not available'} - ${subject} to ${to}`);
      return { success: true, messageId: result.id || result.data?.id, fullResponse: result };
    }
    // SMTP
    else if (transporter) {
      const info = await transporter.sendMail({
        from: `"Cobra Market" <${fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
      });

      console.log(`✅ Email sent via SMTP: ${info.messageId} - ${subject} to ${to}`);
      return { success: true, messageId: info.messageId };
    }

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    if (error.response) {
      console.error('❌ Error details:', JSON.stringify(error.response.body || error.response, null, 2));
    }
    if (error.message.includes('timeout')) {
      console.log('💡 SMTP timeout detected. Railway may be blocking SMTP ports.');
      console.log('💡 Solution: Use Brevo, SendGrid or Resend instead.');
    }
    return { success: false, error: error.message };
  }
};

// ===============================
// EXPORTS
// ===============================
module.exports = { sendEmail, emailTemplates };
