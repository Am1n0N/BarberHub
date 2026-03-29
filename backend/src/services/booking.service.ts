import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Convert "HH:MM" to total minutes since midnight */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Convert total minutes since midnight to "HH:MM" */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

interface OpeningHoursEntry {
  day: number;
  open: string;
  close: string;
  isOpen: boolean;
}

export class BookingService {
  /**
   * Returns available time slots for a barber on a given date,
   * spaced by the selected service's duration.
   */
  async getAvailableSlots(params: {
    shopId: string;
    barberId: string;
    serviceId: string;
    date: string;
  }) {
    const [shop, barber, service] = await Promise.all([
      prisma.shop.findUnique({ where: { id: params.shopId } }),
      prisma.barber.findUnique({ where: { id: params.barberId } }),
      prisma.service.findUnique({ where: { id: params.serviceId } }),
    ]);

    if (!shop) throw Object.assign(new Error('Shop not found'), { statusCode: 404 });
    if (!barber) throw Object.assign(new Error('Barber not found'), { statusCode: 404 });
    if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 });

    const duration = service.durationMin;
    const requestedDate = new Date(params.date);
    const dayOfWeek = requestedDate.getUTCDay(); // 0=Sun, 1=Mon, ...

    // Determine opening hours for this day
    let openTime = '09:00';
    let closeTime = '20:00';
    let isOpen = true;

    if (shop.openingHours && Array.isArray(shop.openingHours)) {
      const dayEntry = (shop.openingHours as unknown as OpeningHoursEntry[]).find(
        (entry) => entry.day === dayOfWeek
      );
      if (dayEntry) {
        openTime = dayEntry.open;
        closeTime = dayEntry.close;
        isOpen = dayEntry.isOpen;
      }
    }

    if (!isOpen) {
      return { slots: [], duration, date: params.date };
    }

    // Generate all possible slots spaced by service duration
    const openMin = timeToMinutes(openTime);
    const closeMin = timeToMinutes(closeTime);
    const allSlots: string[] = [];
    for (let t = openMin; t + duration <= closeMin; t += duration) {
      allSlots.push(minutesToTime(t));
    }

    // Fetch existing bookings for this barber on this date (with their service duration)
    const dayStart = new Date(params.date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(params.date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        barberId: params.barberId,
        date: { gte: dayStart, lte: dayEnd },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      include: { service: { select: { durationMin: true } } },
    });

    // Build occupied time ranges [startMin, endMin)
    const occupiedRanges = existingBookings.map((b) => {
      const startMin = timeToMinutes(b.timeSlot);
      const endMin = startMin + (b.service?.durationMin ?? 30);
      return { start: startMin, end: endMin };
    });

    // Mark each slot as available or not (check for overlap)
    const slots = allSlots.map((slot) => {
      const slotStart = timeToMinutes(slot);
      const slotEnd = slotStart + duration;
      const isAvailable = !occupiedRanges.some(
        (range) => slotStart < range.end && slotEnd > range.start
      );
      return { time: slot, available: isAvailable };
    });

    return { slots, duration, date: params.date };
  }

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

    // Duration-based overlap check: the new booking's time range must not
    // overlap with any existing booking for the same barber on the same day.
    const newStart = timeToMinutes(data.timeSlot);
    const newEnd = newStart + service.durationMin;

    const dayStart = new Date(data.date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(data.date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        barberId: data.barberId,
        date: { gte: dayStart, lte: dayEnd },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      include: { service: { select: { durationMin: true } } },
    });

    const hasOverlap = existingBookings.some((b) => {
      const existingStart = timeToMinutes(b.timeSlot);
      const existingEnd = existingStart + (b.service?.durationMin ?? 30);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      throw Object.assign(new Error('Time slot overlaps with an existing booking'), {
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

  async getBookingsForBarber(barberId: string) {
    const bookings = await prisma.booking.findMany({
      where: { barberId },
      include: {
        shop: { select: { id: true, name: true, slug: true, address: true, city: true, phone: true } },
        client: { select: { id: true, name: true, phone: true } },
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
