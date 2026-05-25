import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

export async function outgoingReport(req, res, next) {
  try {
    const { startDateTime, endDateTime } = req.query;
    if (!startDateTime || !endDateTime) {
      throw new AppError('startDateTime and endDateTime are required', 400);
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    if (isNaN(start) || isNaN(end) || start >= end) {
      throw new AppError('Invalid date range', 400);
    }

    const { page, limit, skip } = getPagination(req.query);
    const where = {
      exitDateTime: { not: null, gte: start, lte: end },
    };
    if (req.query.parkingCode) {
      const parking = await prisma.parking.findUnique({
        where: { code: req.query.parkingCode.toUpperCase() },
      });
      if (parking) where.parkingId = parking.id;
    }

    const [entries, total, aggregate] = await Promise.all([
      prisma.carEntry.findMany({
        where,
        skip,
        take: limit,
        include: { parking: { select: { code: true, name: true, location: true } } },
        orderBy: { exitDateTime: 'desc' },
      }),
      prisma.carEntry.count({ where }),
      prisma.carEntry.aggregate({
        where,
        _sum: { chargedAmount: true },
      }),
    ]);

    res.json({
      success: true,
      summary: { totalCharged: aggregate._sum.chargedAmount || 0, count: total },
      ...paginatedResponse(entries, total, page, limit),
    });
  } catch (err) {
    next(err);
  }
}

export async function enteredReport(req, res, next) {
  try {
    const { startDateTime, endDateTime } = req.query;
    if (!startDateTime || !endDateTime) {
      throw new AppError('startDateTime and endDateTime are required', 400);
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    if (isNaN(start) || isNaN(end) || start >= end) {
      throw new AppError('Invalid date range', 400);
    }

    const { page, limit, skip } = getPagination(req.query);
    const where = {
      entryDateTime: { gte: start, lte: end },
    };
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
        include: { parking: { select: { code: true, name: true, location: true } } },
        orderBy: { entryDateTime: 'desc' },
      }),
      prisma.carEntry.count({ where }),
    ]);

    res.json({
      success: true,
      summary: { count: total },
      ...paginatedResponse(entries, total, page, limit),
    });
  } catch (err) {
    next(err);
  }
}

export async function carsCountByLocation(req, res, next) {
  try {
    const parkings = await prisma.parking.findMany({
      include: {
        _count: {
          select: {
            carEntries: { where: { exitDateTime: null } },
          },
        },
      },
    });

    const data = parkings.map((p) => ({
      parkingCode: p.code,
      parkingName: p.name,
      location: p.location,
      availableSpaces: p.availableSpaces,
      totalSpaces: p.totalSpaces,
      carsCurrentlyParked: p._count.carEntries,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
