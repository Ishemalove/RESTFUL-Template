import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

export async function createParking(req, res, next) {
  try {
    const { code, name, numberOfSpaces, location, feePerHour } = req.body;
    const existing = await prisma.parking.findUnique({ where: { code } });
    if (existing) throw new AppError('Parking code already exists', 409);

    const parking = await prisma.parking.create({
      data: {
        code: code.toUpperCase(),
        name,
        totalSpaces: numberOfSpaces,
        availableSpaces: numberOfSpaces,
        location,
        feePerHour: parseFloat(feePerHour),
      },
    });

    res.status(201).json({ success: true, message: 'Parking registered', data: parking });
  } catch (err) {
    next(err);
  }
}

export async function listParkings(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [parkings, total] = await Promise.all([
      prisma.parking.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.parking.count(),
    ]);
    res.json({ success: true, ...paginatedResponse(parkings, total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function getParkingByCode(req, res, next) {
  try {
    const parking = await prisma.parking.findUnique({
      where: { code: req.params.code.toUpperCase() },
    });
    if (!parking) throw new AppError('Parking not found', 404);
    res.json({ success: true, data: parking });
  } catch (err) {
    next(err);
  }
}

export async function updateParking(req, res, next) {
  try {
    const { name, location, feePerHour, numberOfSpaces } = req.body;
    const parking = await prisma.parking.findUnique({
      where: { code: req.params.code.toUpperCase() },
    });
    if (!parking) throw new AppError('Parking not found', 404);

    const occupied = parking.totalSpaces - parking.availableSpaces;
    let totalSpaces = parking.totalSpaces;
    let availableSpaces = parking.availableSpaces;

    if (numberOfSpaces !== undefined) {
      totalSpaces = parseInt(numberOfSpaces, 10);
      if (totalSpaces < occupied) {
        throw new AppError(`Cannot reduce spaces below occupied count (${occupied})`, 400);
      }
      availableSpaces = totalSpaces - occupied;
    }

    const updated = await prisma.parking.update({
      where: { id: parking.id },
      data: {
        ...(name && { name }),
        ...(location && { location }),
        ...(feePerHour !== undefined && { feePerHour: parseFloat(feePerHour) }),
        totalSpaces,
        availableSpaces,
      },
    });

    res.json({ success: true, message: 'Parking updated', data: updated });
  } catch (err) {
    next(err);
  }
}
