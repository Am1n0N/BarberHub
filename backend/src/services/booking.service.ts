import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BookingService {
  async createBooking(data: {
    shopId: string;
    clientId: string;
    barberId: string;
    serviceId: string;
    date: string;
    timeSlot: string;
  }) {
    const [shop, barber, service] = await Promise.all([
      prisma.shop.findUnique({ where: { id: data.shopId } }),
      prisma.barber.findUnique({ where: { id: data.barberId } }),
      prisma.service.findUnique({ where: { id: data.serviceId } }),
    ]);

    if (!shop) {
      throw Object.assign(new Error('Shop not found'), { statusCode: 404 });
    }
    if (!barber) {
      throw Object.assign(new Error('Barber not found'), { statusCode: 404 });
    }
    if (!service) {
      throw Object.assign(new Error('Service not found'), { statusCode: 404 });
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        barberId: data.barberId,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    });

    if (existingBooking) {
      throw Object.assign(new Error('Time slot already booked'), {
        statusCode: 409,
      });
    }

    const booking = await prisma.booking.create({
      data: {
        shopId: data.shopId,
        clientId: data.clientId,
        barberId: data.barberId,
        serviceId: data.serviceId,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
      },
      include: {
        shop: { select: { id: true, name: true } },
        barber: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        service: true,
      },
    });

    return booking;
  }

  async getBookingsForShop(shopId: string, date?: string) {
    const where: Record<string, unknown> = { shopId };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        barber: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        service: true,
      },
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
    });

    return bookings;
  }

  async getBookingsForClient(clientId: string) {
    const bookings = await prisma.booking.findMany({
      where: { clientId },
      include: {
        shop: { select: { id: true, name: true, slug: true, address: true, city: true, phone: true } },
        barber: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        service: true,
      },
      orderBy: [{ date: 'desc' }, { timeSlot: 'desc' }],
    });

    return bookings;
  }

  async cancelBookingByClient(bookingId: string, clientId: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }

    if (booking.clientId !== clientId) {
      throw Object.assign(new Error('Not authorized to cancel this booking'), { statusCode: 403 });
    }

    if (!['PENDING', 'CONFIRMED', 'DEPOSIT_PAID'].includes(booking.status)) {
      throw Object.assign(new Error('Cannot cancel a booking that is already in progress or completed'), { statusCode: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: {
        shop: { select: { id: true, name: true, slug: true, address: true, city: true, phone: true } },
        barber: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        service: true,
      },
    });

    return updated;
  }

  async updateBookingStatus(
    id: string,
    status: string
  ) {
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: status as 'PENDING' | 'CONFIRMED' | 'DEPOSIT_PAID' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED' },
    });

    return updated;
  }

  async checkinBooking(id: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { client: true, service: true },
    });

    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'CHECKED_IN' },
    });

    const maxPos = await prisma.queueEntry.aggregate({
      where: {
        shopId: booking.shopId,
        status: { in: ['WAITING', 'IN_PROGRESS'] },
      },
      _max: { position: true },
    });

    const position = (maxPos._max.position ?? 0) + 1;

    const queueEntry = await prisma.queueEntry.create({
      data: {
        shopId: booking.shopId,
        clientId: booking.clientId,
        barberId: booking.barberId,
        serviceId: booking.serviceId,
        clientName: booking.client.name,
        position,
        type: 'BOOKED',
        status: 'WAITING',
      },
    });

    return queueEntry;
  }
}

export const bookingService = new BookingService();
