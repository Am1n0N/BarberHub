import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { bookingService } from '../services/booking.service';

export class BookingController {
  async createBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shopId, barberId, serviceId, date, timeSlot } = req.body;
      const booking = await bookingService.createBooking({
        shopId,
        clientId: req.user!.id,
        barberId,
        serviceId,
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
