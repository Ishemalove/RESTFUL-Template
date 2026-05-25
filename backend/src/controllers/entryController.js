import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { calculateChargedAmount } from '../utils/parkingFee.js';

function formatDuration(entryDateTime, exitDateTime) {
  const ms = new Date(exitDateTime) - new Date(entryDateTime);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export async function carEntry(req, res, next) {
  try {
    const { plateNumber, parkingCode, entryDateTime } = req.body;
    const code = parkingCode.toUpperCase();

    const parking = await prisma.parking.findUnique({ where: { code } });
    if (!parking) throw new AppError('Parking not found', 404);
    if (parking.availableSpaces <= 0) throw new AppError('No available spaces', 400);

    const active = await prisma.carEntry.findFirst({
      where: {
        plateNumber: plateNumber.toUpperCase(),
        parkingId: parking.id,
        exitDateTime: null,
      },
    });
    if (active) throw new AppError('Vehicle already parked at this location', 409);

    const entryTime = entryDateTime ? new Date(entryDateTime) : new Date();

    const [entry] = await prisma.$transaction([
      prisma.carEntry.create({
        data: {
          plateNumber: plateNumber.toUpperCase(),
          parkingId: parking.id,
          attendantId: req.user.id,
          entryDateTime: entryTime,
          exitDateTime: null,
          chargedAmount: 0,
        },
        include: { parking: true, attendant: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.parking.update({
        where: { id: parking.id },
        data: { availableSpaces: { decrement: 1 } },
      }),
    ]);

    const ticket = {
      ticketId: entry.id,
      plateNumber: entry.plateNumber,
      parkingCode: entry.parking.code,
      parkingName: entry.parking.name,
      location: entry.parking.location,
      entryDateTime: entry.entryDateTime,
      feePerHour: entry.parking.feePerHour,
      message: 'Keep this ticket for exit and billing',
    };

    res.status(201).json({
      success: true,
      message: 'Car entry registered',
      data: { entry, ticket },
    });
  } catch (err) {
    next(err);
  }
}

export async function carExit(req, res, next) {
  try {
    const { entryId, exitDateTime } = req.body;

    const entry = await prisma.carEntry.findUnique({
      where: { id: entryId },
      include: { parking: true },
    });
    if (!entry) throw new AppError('Entry record not found', 404);
    if (entry.exitDateTime) throw new AppError('Vehicle already exited', 400);

    const exitTime = exitDateTime ? new Date(exitDateTime) : new Date();
    if (exitTime <= entry.entryDateTime) {
      throw new AppError('Exit time must be after entry time', 400);
    }

    const chargedAmount = calculateChargedAmount(
      entry.entryDateTime,
      exitTime,
      entry.parking.feePerHour
    );

    const [updated] = await prisma.$transaction([
      prisma.carEntry.update({
        where: { id: entryId },
        data: { exitDateTime: exitTime, chargedAmount },
        include: { parking: true },
      }),
      prisma.parking.update({
        where: { id: entry.parkingId },
        data: { availableSpaces: { increment: 1 } },
      }),
    ]);

    const bill = {
      billId: updated.id,
      plateNumber: updated.plateNumber,
      parkingCode: updated.parking.code,
      parkingName: updated.parking.name,
      entryDateTime: updated.entryDateTime,
      exitDateTime: updated.exitDateTime,
      duration: formatDuration(updated.entryDateTime, updated.exitDateTime),
      feePerHour: updated.parking.feePerHour,
      chargedAmount: updated.chargedAmount,
      currency: 'RWF',
    };

    res.json({
      success: true,
      message: 'Car exit processed',
      data: { entry: updated, bill },
    });
  } catch (err) {
    next(err);
  }
}

export async function listActiveEntries(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const where = { exitDateTime: null };
    if (req.query.parkingCode) {
      const parking = await prisma.parking.findUnique({
        where: { code: req.query.parkingCode.toUpperCase() },
      });
      if (parking) where.parkingId = parking.id;
    }

    const [entries, total] = await Promise.all([
      prisma.carEntry.findMany({
        where,
        skip,
        take: limit,
        include: { parking: true },
        orderBy: { entryDateTime: 'desc' },
      }),
      prisma.carEntry.count({ where }),
    ]);

    res.json({ success: true, ...paginatedResponse(entries, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function getEntryById(req, res, next) {
  try {
    const entry = await prisma.carEntry.findUnique({
      where: { id: req.params.id },
      include: { parking: true, attendant: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!entry) throw new AppError('Entry not found', 404);
    res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
}
