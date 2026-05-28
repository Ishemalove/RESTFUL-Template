import crypto from 'crypto';

export function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export function hashOtpCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function otpExpiresAt(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
