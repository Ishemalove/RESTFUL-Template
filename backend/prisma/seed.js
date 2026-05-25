import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const attendantPassword = await bcrypt.hash('Attendant@123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@xwz.rw' },
    update: {},
    create: {
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@xwz.rw',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'attendant@xwz.rw' },
    update: {},
    create: {
      firstName: 'Jean',
      lastName: 'Uwimana',
      email: 'attendant@xwz.rw',
      password: attendantPassword,
      role: 'PARKING_ATTENDANT',
    },
  });

  await prisma.parking.upsert({
    where: { code: 'KG-001' },
    update: {},
    create: {
      code: 'KG-001',
      name: 'Kigali City Center Parking',
      totalSpaces: 50,
      availableSpaces: 50,
      location: 'KN 4 Ave, Kigali',
      feePerHour: 500,
    },
  });

  await prisma.parking.upsert({
    where: { code: 'KG-002' },
    update: {},
    create: {
      code: 'KG-002',
      name: 'Remera Market Parking',
      totalSpaces: 30,
      availableSpaces: 30,
      location: 'Remera, Kigali',
      feePerHour: 400,
    },
  });

  console.log('Seed completed: admin@xwz.rw / Admin@123, attendant@xwz.rw / Attendant@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
