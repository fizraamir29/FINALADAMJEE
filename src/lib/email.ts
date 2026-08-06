import nodemailer from 'nodemailer';

export interface OrderItemEmailData {
  name: string;
  quantity: number;
  price?: number;
}

export interface OrderEmailData {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  items?: OrderItemEmailData[];
  total?: number;
  paymentMethod?: string;
  shippingAddress?: string;
}

// Helper to construct Nodemailer transporter based on .env configuration
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return null;
}

const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'no-reply@adamjeecomputers.com';
const FROM_NAME = process.env.SMTP_FROM_NAME || 'Adamjee Computers';
const STORE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://adamjeecomputers.com';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
  message?: string;
}

/**
 * Generic email dispatcher with graceful fallback (logs to console if SMTP is unconfigured)
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<EmailResult> {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    });

    console.log(`[EMAIL DISPATCHED] ID: ${info.messageId} | To: ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message || error);
    return { success: false, error: error.message || 'Email delivery failed' };
  }
}

/**
 * Password Reset Email (Resend API or SMTP fallback)
 */
export async function sendPasswordResetEmail(to: string, code: string): Promise<{ success: boolean }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const subject = 'Your Adamjee Computers password reset code';
  const textContent = `We received a request to reset the password for your Adamjee Computers account.\n\nYour verification code is: ${code}\n\nThis code expires in 15 minutes. If you did not request a password reset, you can safely ignore this email — your password will not change.\n\nAdamjee Computers Team`;

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Adamjee Computers <security@adamjeecomputers.com>',
          to: [to],
          subject,
          text: textContent,
        }),
      });
      if (res.ok) return { success: true };
      console.error('Password reset email failed:', await res.text());
    } catch (err: any) {
      console.error('Password reset email error:', err.message);
    }
  }

  const html = `<div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Password Reset Request</h2>
    <p>Your verification code is: <strong style="font-size: 20px; color: #164475;">${code}</strong></p>
    <p>This code expires in 15 minutes.</p>
  </div>`;

  await sendEmail({ to, subject, html, text: textContent });
  return { success: true };
}

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────

const HEADER_TEMPLATE = `
  <div style="background-color: #0a1b2d; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: 1px;">
      ADAMJEE <span style="color: #00d2ff;">COMPUTERS</span>
    </h1>
    <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; font-family: Arial, sans-serif;">
      Pakistan's Premier Tech & Gaming Hub
    </p>
  </div>
`;

const FOOTER_TEMPLATE = `
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 12px; color: #64748b;">
    <p style="margin: 0 0 8px 0;">Need assistance? Reach out to our support team at <a href="mailto:support@adamjeecomputers.com" style="color: #164475; text-decoration: none; font-weight: bold;">support@adamjeecomputers.com</a> or WhatsApp <a href="https://wa.me/923000000000" style="color: #25D366; text-decoration: none; font-weight: bold;">+92 300 0000000</a>.</p>
    <p style="margin: 0; color: #94a3b8;">© ${new Date().getFullYear()} Adamjee Computers. All rights reserved.</p>
  </div>
`;

/**
 * 1. Welcome / Sign-Up Email
 */
export async function sendWelcomeEmail({ to, name }: { to: string; name: string }): Promise<EmailResult> {
  const subject = `Welcome to Adamjee Computers, ${name}! 🎉`;
  const html = `
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
      ${HEADER_TEMPLATE}
      <div style="padding: 32px 24px;">
        <h2 style="color: #0a1b2d; font-size: 22px; margin-top: 0;">Welcome aboard, ${name}! 👋</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Thank you for creating an account with <strong>Adamjee Computers</strong>. We're excited to have you in our community of gamers, creators, and tech enthusiasts.
        </p>
        <div style="background-color: #f1f5f9; border-left: 4px solid #164475; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #0a1b2d;">With your new account, you can:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
            <li>Track your orders in real-time</li>
            <li>Save custom PC builds & component wishlists</li>
            <li>Enjoy exclusive discounts & promotional deals</li>
            <li>Accelerated 1-click checkout</li>
          </ul>
        </div>
        <div style="text-align: center; margin-top: 32px;">
          <a href="${STORE_URL}" style="background-color: #164475; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">Explore Store Now</a>
        </div>
      </div>
      ${FOOTER_TEMPLATE}
    </div>
  `;
  return sendEmail({ to, subject, html });
}

/**
 * 2. Login Alert Email
 */
export async function sendLoginNotificationEmail({
  to,
  name,
  time,
}: {
  to: string;
  name: string;
  time?: string;
}): Promise<EmailResult> {
  const loginTime = time || new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
  const subject = `Security Alert: New sign-in to your Adamjee Computers account`;
  const html = `
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
      ${HEADER_TEMPLATE}
      <div style="padding: 32px 24px;">
        <h2 style="color: #0a1b2d; font-size: 20px; margin-top: 0;">New Account Sign-In Detected 🔒</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Hello <strong>${name}</strong>, we noticed a successful login to your Adamjee Computers account.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fafc; border-radius: 8px;">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569; width: 120px;">Account Email:</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0a1b2d;">${to}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: bold; color: #475569;">Time (PKT):</td>
            <td style="padding: 12px 16px; color: #0a1b2d;">${loginTime}</td>
          </tr>
        </table>
        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
          If this was you, no action is needed. If you did not sign in, please reset your password immediately or contact support.
        </p>
      </div>
      ${FOOTER_TEMPLATE}
    </div>
  `;
  return sendEmail({ to, subject, html });
}

/**
 * 3. Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(
  data: OrderEmailData | { to: string; name: string; orderId: string; items: any[]; total: number; shippingAddress?: string; paymentMethod?: string }
): Promise<EmailResult> {
  const to = 'customerEmail' in data ? data.customerEmail : (data as any).to;
  const name = 'customerName' in data ? data.customerName || 'Customer' : (data as any).name || 'Customer';
  const orderId = data.orderId;
  const items = data.items || [];
  const total = data.total || 0;
  const shippingAddress = data.shippingAddress;
  const paymentMethod = data.paymentMethod;

  const subject = `Order Confirmation #${orderId} - Adamjee Computers`;

  const itemRows = items
    .map(
      item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 14px;">
        <strong>${item.name}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #64748b; text-align: center; font-size: 14px;">
        x${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #0a1b2d; text-align: right; font-weight: bold; font-size: 14px;">
        PKR ${((item.price || 0) * item.quantity).toLocaleString('en-PK')}
      </td>
    </tr>
  `
    )
    .join('');

  const html = `
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
      ${HEADER_TEMPLATE}
      <div style="padding: 32px 24px;">
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
          <h2 style="color: #065f46; margin: 0; font-size: 18px;">Thank You for Your Order! 🛍️</h2>
          <p style="color: #047857; margin: 4px 0 0 0; font-size: 14px;">Order ID: <strong>#${orderId}</strong></p>
        </div>

        <p style="font-size: 15px; color: #334155;">
          Hi <strong>${name}</strong>, we have received your order and are preparing it for shipment.
        </p>

        <h3 style="color: #0a1b2d; font-size: 16px; border-bottom: 2px solid #0a1b2d; padding-bottom: 8px; margin-top: 24px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #475569;">Item</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 13px; color: #475569;">Qty</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #475569;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 16px; padding: 12px; background-color: #f8fafc; border-radius: 8px;">
          <span style="font-size: 16px; font-weight: bold; color: #0a1b2d;">Total Amount: </span>
          <span style="font-size: 20px; font-weight: 800; color: #164475;">PKR ${total.toLocaleString('en-PK')}</span>
        </div>

        ${
          shippingAddress || paymentMethod
            ? `
          <div style="margin-top: 24px; padding: 16px; background-color: #f1f5f9; border-radius: 8px; font-size: 14px;">
            ${shippingAddress ? `<p style="margin: 0 0 8px 0; color: #334155;"><strong>Shipping Address:</strong> ${shippingAddress}</p>` : ''}
            ${paymentMethod ? `<p style="margin: 0; color: #334155;"><strong>Payment Method:</strong> ${paymentMethod}</p>` : ''}
          </div>
        `
            : ''
        }

        <div style="text-align: center; margin-top: 28px;">
          <a href="${STORE_URL}/account" style="background-color: #164475; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Track Order Status</a>
        </div>
      </div>
      ${FOOTER_TEMPLATE}
    </div>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * 4. Order Status Update Email (Pending -> Processing -> Shipped -> Delivered -> Cancelled)
 */
export async function sendOrderStatusEmail({
  to,
  name,
  orderId,
  newStatus,
  trackingNumber,
  items,
  total,
}: {
  to: string;
  name: string;
  orderId: string;
  newStatus: string;
  trackingNumber?: string;
  items?: Array<{ name: string; quantity: number }>;
  total?: number;
}): Promise<EmailResult> {
  const statusUpper = newStatus.toUpperCase();

  let statusColor = '#164475'; // default blue
  let statusBadgeBg = '#e0f2fe';
  let messageText = `The status of your order #${orderId} has been updated to ${statusUpper}.`;

  if (statusUpper === 'PROCESSING') {
    statusColor = '#d97706';
    statusBadgeBg = '#fef3c7';
    messageText = `Great news! Your order #${orderId} is now being packed and prepared for dispatch by our technician team.`;
  } else if (statusUpper === 'SHIPPED') {
    statusColor = '#2563eb';
    statusBadgeBg = '#dbeafe';
    messageText = `Exciting news! Your order #${orderId} has been handed over to our courier partner and is on its way to you.`;
  } else if (statusUpper === 'DELIVERED') {
    statusColor = '#16a34a';
    statusBadgeBg = '#dcfce7';
    messageText = `Your order #${orderId} has been successfully delivered. We hope you enjoy your new hardware!`;
  } else if (statusUpper === 'CANCELLED') {
    statusColor = '#dc2626';
    statusBadgeBg = '#fee2e2';
    messageText = `Your order #${orderId} has been cancelled. If you believe this was in error, please contact our support team immediately.`;
  }

  const subject = `Order #${orderId} Update: ${statusUpper} - Adamjee Computers`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
      ${HEADER_TEMPLATE}
      <div style="padding: 32px 24px;">
        <p style="font-size: 15px; color: #334155; margin-top: 0;">Hi <strong>${name}</strong>,</p>

        <div style="background-color: ${statusBadgeBg}; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 6px 0; color: ${statusColor}; font-size: 18px;">Order Status: ${statusUpper}</h3>
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5;">${messageText}</p>
        </div>

        ${
          trackingNumber
            ? `
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #475569;">
              <strong>Courier Tracking Number:</strong> <span style="color: #0a1b2d; font-family: monospace; font-size: 16px; font-weight: bold; background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${trackingNumber}</span>
            </p>
          </div>
        `
            : ''
        }

        ${
          total
            ? `
          <p style="font-size: 14px; color: #475569;">
            Order Total: <strong>PKR ${total.toLocaleString('en-PK')}</strong>
          </p>
        `
            : ''
        }

        <div style="text-align: center; margin-top: 28px;">
          <a href="${STORE_URL}/account" style="background-color: #164475; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">View Order Details</a>
        </div>
      </div>
      ${FOOTER_TEMPLATE}
    </div>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * 5. Contact Form Auto-Reply Email
 */
export async function sendContactAutoReplyEmail({
  to,
  name,
  subject: inquirySubject,
}: {
  to: string;
  name: string;
  subject?: string;
}): Promise<EmailResult> {
  const subject = `We've received your message - Adamjee Computers Support`;
  const html = `
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b;">
      ${HEADER_TEMPLATE}
      <div style="padding: 32px 24px;">
        <h2 style="color: #0a1b2d; font-size: 20px; margin-top: 0;">We received your inquiry 📩</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">
          Hi <strong>${name}</strong>, thank you for reaching out to Adamjee Computers.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Our customer care specialists are reviewing your request${inquirySubject ? ` regarding "<strong>${inquirySubject}</strong>"` : ''} and will respond within 24 business hours.
        </p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #164475; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #64748b;">
            For urgent inquiries regarding live orders or custom gaming rig modifications, feel free to chat directly with us on WhatsApp at <strong>+92 300 0000000</strong>.
          </p>
        </div>
      </div>
      ${FOOTER_TEMPLATE}
    </div>
  `;
  return sendEmail({ to, subject, html });
}
