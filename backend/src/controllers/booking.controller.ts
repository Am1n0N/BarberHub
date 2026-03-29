import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { bookingService } from '../services/booking.service';

const prisma = new PrismaClient();

export class BookingController {
  async createBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shop, barber, service, date, timeSlot, clientName, clientPhone } = req.body;
      
      let clientId: string;

      if (req.user) {
        // Authenticated user — validate they exist in database
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
          throw Object.assign(new Error('User not found'), { statusCode: 401 });
        }
        clientId = req.user.id;
      } else {
        // Anonymous booking — require name and phone
        if (!clientName || !clientPhone) {
          throw Object.assign(new Error('Client name and phone are required for anonymous bookings'), { statusCode: 400 });
        }
        let client = await prisma.user.findUnique({ where: { phone: clientPhone } });
        if (!client) {
          const bcrypt = await import('bcryptjs');
          const hashedPassword = await bcrypt.hash(clientPhone, 10);
          client = await prisma.user.create({
            data: {
              phone: clientPhone,
              name: clientName,
              role: 'CLIENT',
              password: hashedPassword,
            },
          });
        }
        clientId = client.id;
      }

      const booking = await bookingService.createBooking({
        shopId: shop,
        clientId,
        barberId: barber,
        serviceId: service,
        date,
        timeSlot,
      });
      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  }

  async getBookingsForShop(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = req.query.date as string | undefined;
      const bookings = await bookingService.getBookingsForShop(
        req.params.shopId as string,
        date
      );
      res.json(bookings);
    } catch (err) {
      next(err);
    }
  }

  async getMyBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await bookingService.getBookingsForClient(req.user!.id);
      res.json(bookings);
    } catch (err) {
      next(err);
    }
  }

  async cancelBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.cancelBookingByClient(
        req.params.id as string,
        req.user!.id
      );
      res.json(booking);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const booking = await bookingService.updateBookingStatus(
        req.params.id as string,
        status
      );
      res.json(booking);
    } catch (err) {
      next(err);
    }
  }

  async checkin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queueEntry = await bookingService.checkinBooking(req.params.id as string);
      res.json(queueEntry);
    } catch (err) {
      next(err);
    }
  }
}

export const bookingController = new BookingController();
