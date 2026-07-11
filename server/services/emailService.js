import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const configured = user && pass && !user.includes('your_email') && !pass.includes('your_app');

  if (!configured) {
    console.log('Email skipped (SMTP not configured):', subject);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || user,
    to,
    subject,
    html,
  });
};

export const orderConfirmationEmail = (order, userEmail) => ({
  to: userEmail,
  subject: `Order Confirmed - ${order.orderNumber} | Shivam Traders`,
  html: `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #D4AF37;">Shivam Traders</h1>
      <h2>Thank you for your order!</h2>
      <p>Order Number: <strong>${order.orderNumber}</strong></p>
      <p>Total: <strong>₹${order.totalPrice.toLocaleString('en-IN')}</strong></p>
      <p>Payment: ${order.paymentMethod.toUpperCase()} - ${order.paymentStatus}</p>
      <p>We'll notify you when your divine murti is on its way.</p>
      <p style="color: #FF9933;">🙏 Namaste</p>
    </div>
  `,
});

export const resetPasswordEmail = (resetUrl) => ({
  subject: 'Password Reset - Shivam Traders',
  html: `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #D4AF37;">Shivam Traders</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background: #FF9933; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>This link expires in 30 minutes.</p>
    </div>
  `,
});
