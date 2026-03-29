import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up
  await prisma.queueEntry.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.shopRequest.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  // Admin user
  const admin = await prisma.user.create({
    data: { phone: '99000000', name: 'Admin', password, role: 'ADMIN' },
  });

  // Owner user
  const owner = await prisma.user.create({
    data: { phone: '55100000', name: 'سامي المالك', password, role: 'OWNER', language: 'derja' },
  });

  // Barber users
  const barberUser1 = await prisma.user.create({
    data: { phone: '55111111', name: 'سامي', password, role: 'BARBER', language: 'derja' },
  });
  const barberUser2 = await prisma.user.create({
    data: { phone: '55222222', name: 'كريم', password, role: 'BARBER', language: 'derja' },
  });
  const barberUser3 = await prisma.user.create({
    data: { phone: '55333333', name: 'نبيل', password, role: 'BARBER', language: 'derja' },
  });

  // Client users
  const client1 = await prisma.user.create({
    data: { phone: '55400001', name: 'أحمد بن صالح', password, role: 'CLIENT', language: 'derja' },
  });
  const client2 = await prisma.user.create({
    data: { phone: '55400002', name: 'محمد العربي', password, role: 'CLIENT', language: 'derja' },
  });
  const client3 = await prisma.user.create({
    data: { phone: '55400003', name: 'يوسف', password, role: 'CLIENT', language: 'derja' },
  });
  const client4 = await prisma.user.create({
    data: { phone: '55400004', name: 'علي', password, role: 'CLIENT', language: 'derja' },
  });

  // Shop
  const shop = await prisma.shop.create({
    data: {
      name: 'حانوت سامي',
      slug: 'hanut-sami',
      address: 'نهج الحبيب بورقيبة، تونس',
      city: 'تونس',
      phone: '71123456',
      ownerId: owner.id,
      latitude: 36.8065,
      longitude: 10.1815,
      openingHours: [
        { day: 0, open: '09:00', close: '18:00', isOpen: false },
        { day: 1, open: '09:00', close: '20:00', isOpen: true },
        { day: 2, open: '09:00', close: '20:00', isOpen: true },
        { day: 3, open: '09:00', close: '20:00', isOpen: true },
        { day: 4, open: '09:00', close: '20:00', isOpen: true },
        { day: 5, open: '09:00', close: '20:00', isOpen: true },
        { day: 6, open: '09:00', close: '18:00', isOpen: true },
      ],
      isActive: true,
    },
  });

  // Barbers
  const barber1 = await prisma.barber.create({
    data: { userId: barberUser1.id, shopId: shop.id, commissionRate: 0.5, isAvailable: true },
  });
  const barber2 = await prisma.barber.create({
    data: { userId: barberUser2.id, shopId: shop.id, commissionRate: 0.5, isAvailable: true },
  });
  const barber3 = await prisma.barber.create({
    data: { userId: barberUser3.id, shopId: shop.id, commissionRate: 0.45, isAvailable: false },
  });

  // Services
  const service1 = await prisma.service.create({
    data: { shopId: shop.id, nameDerja: 'حلاقة بسيطة', nameFr: 'Coupe simple', price: 15, durationMin: 20, isActive: true },
  });
  const service2 = await prisma.service.create({
    data: { shopId: shop.id, nameDerja: 'لحية', nameFr: 'Taille de barbe', price: 10, durationMin: 15, isActive: true },
  });
  const service3 = await prisma.service.create({
    data: { shopId: shop.id, nameDerja: 'باكاج كامل', nameFr: 'Forfait complet', price: 30, durationMin: 40, isActive: true },
  });
  const service4 = await prisma.service.create({
    data: { shopId: shop.id, nameDerja: 'حلاقة صغار', nameFr: 'Coupe enfant', price: 10, durationMin: 15, isActive: true },
  });

  // Queue entries (active)
  await prisma.queueEntry.create({
    data: { shopId: shop.id, clientId: client1.id, barberId: barber1.id, serviceId: service1.id, clientName: 'أحمد', position: 1, type: 'BOOKED', status: 'IN_PROGRESS', startedAt: new Date() },
  });
  await prisma.queueEntry.create({
    data: { shopId: shop.id, clientId: client2.id, barberId: barber2.id, serviceId: service2.id, clientName: 'محمد', position: 2, type: 'WALK_IN', status: 'IN_PROGRESS', startedAt: new Date() },
  });
  await prisma.queueEntry.create({
    data: { shopId: shop.id, clientId: client3.id, clientName: 'يوسف', position: 3, type: 'WALK_IN', status: 'WAITING' },
  });
  await prisma.queueEntry.create({
    data: { shopId: shop.id, clientId: client4.id, serviceId: service3.id, clientName: 'علي', position: 4, type: 'BOOKED', status: 'WAITING' },
  });

  // Bookings (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.booking.create({
    data: { shopId: shop.id, clientId: client1.id, barberId: barber1.id, serviceId: service1.id, date: today, timeSlot: '10:00', status: 'CONFIRMED', depositAmount: 5, depositPaid: true },
  });
  await prisma.booking.create({
    data: { shopId: shop.id, clientId: client2.id, barberId: barber2.id, serviceId: service3.id, date: today, timeSlot: '11:30', status: 'PENDING', depositAmount: 10, depositPaid: false },
  });
  await prisma.booking.create({
    data: { shopId: shop.id, clientId: client3.id, barberId: barber1.id, serviceId: service2.id, date: today, timeSlot: '14:00', status: 'CONFIRMED', depositAmount: 0, depositPaid: false },
  });

  console.log('✅ Seed complete!');
  console.log(`  Admin: phone=99000000, password=password123`);
  console.log(`  Owner: phone=55100000, password=password123`);
  console.log(`  Shop: ${shop.name} (slug: ${shop.slug})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
