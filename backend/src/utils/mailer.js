import nodemailer from 'nodemailer';
import logger from './logger.js';

let cachedTransporter;

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  // Gmail app passwords are often copied with spaces; remove all whitespace.
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function getTransporter() {
  if (cachedTransporter !== undefined) return cachedTransporter;
  cachedTransporter = createTransporter();
  return cachedTransporter;
}

function buildOtpEmailTemplate({ firstName, code }) {
  return {
    subject: 'Verify your XWZ Parking account',
    text: `Hi ${firstName},

Your one-time verification code is: ${code}

This code expires in 10 minutes.
If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">Verify your account</h2>
        <p style="margin: 0 0 16px;">Hi ${firstName},</p>
        <p style="margin: 0 0 16px;">Use this one-time code to verify your XWZ Parking account:</p>
        <div style="font-size: 28px; letter-spacing: 8px; font-weight: 700; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; text-align: center; margin-bottom: 16px;">
          ${code}
        </div>
        <p style="margin: 0 0 8px;">This code expires in <b>10 minutes</b>.</p>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">If you did not request this, you can ignore this email.</p>
      </div>
    `,
  };
}

export async function sendOtpEmail({ to, firstName, code }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error('SMTP is not configured');
  }

  const template = buildOtpEmailTemplate({ firstName, code });
  await transporter.sendMail({
    from,
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
  logger.info(`OTP email sent to ${to}`);
}
