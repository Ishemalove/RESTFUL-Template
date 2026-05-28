import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateOtpCode, hashOtpCode, otpExpiresAt } from '../utils/otp.js';
import { sendOtpEmail } from '../utils/mailer.js';
import logger from '../utils/logger.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

function sanitizeUser(user) {
  const { password, otpCodeHash, otpExpiresAt, otpAttempts, ...rest } = user;
  return rest;
}

export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);

    const hashed = await bcrypt.hash(password, 12);
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'PARKING_ATTENDANT';
    const otpCode = generateOtpCode();
    const otpCodeHash = hashOtpCode(otpCode);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashed,
        role: userRole,
        otpCodeHash,
        otpExpiresAt: otpExpiresAt(10),
      },
    });

    try {
      await sendOtpEmail({ to: user.email, firstName: user.firstName, code: otpCode });
    } catch (mailErr) {
      logger.error('OTP email send failed:', mailErr);
      await prisma.user.delete({ where: { id: user.id } });
      throw new AppError('Could not send OTP email. Please try again.', 502);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verify OTP sent to your email.',
      data: {
        email: user.email,
        requiresOtpVerification: true,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid email or password', 401);
    if (!user.emailVerifiedAt) throw new AppError('Please verify your account with OTP first', 403);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid email or password', 401);

    const token = signToken(user);
    res.json({
      success: true,
      message: 'Login successful',
      data: { user: sanitizeUser(user), token },
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);
    if (user.emailVerifiedAt) throw new AppError('Account already verified', 400);
    if (!user.otpCodeHash || !user.otpExpiresAt) throw new AppError('No OTP found. Request another code', 400);
    if (user.otpExpiresAt < new Date()) throw new AppError('OTP expired. Request another code', 400);

    const incomingHash = hashOtpCode(otp);
    if (incomingHash !== user.otpCodeHash) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: { increment: 1 } },
      });
      throw new AppError('Invalid OTP code', 400);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        otpCodeHash: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    const token = signToken(updated);
    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: { user: sanitizeUser(updated), token },
    });
  } catch (err) {
    next(err);
  }
}

export async function resendOtp(req, res, next) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);
    if (user.emailVerifiedAt) throw new AppError('Account already verified', 400);

    const otpCode = generateOtpCode();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCodeHash: hashOtpCode(otpCode),
        otpExpiresAt: otpExpiresAt(10),
        otpAttempts: 0,
      },
    });

    try {
      await sendOtpEmail({ to: user.email, firstName: user.firstName, code: otpCode });
    } catch (mailErr) {
      throw new AppError('Could not send OTP email. Please try again.', 502);
    }

    res.json({
      success: true,
      message: 'A new OTP has been sent',
      data: { email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}
