import { Router } from 'express';
import { body } from 'express-validator';
import { bookingController } from '../controllers/booking.controller';
import { authenticate, authenticateOptional, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/',
  authenticateOptional,
  validate([
    body('shop').notEmpty().withMessage('Shop ID is required'),
    body('barber').notEmpty().withMessage('Barber ID is required'),
    body('service').notEmpty().withMessage('Service ID is required'),
    body('date').notEmpty().isISO8601().withMessage('Valid date is required'),
    body('timeSlot').notEmpty().withMessage('Time slot is required'),
    body('clientName').optional(),
    body('clientPhone').optional(),
  ]),
  (req, res, next) => bookingController.createBooking(req, res, next)
);

router.get(
  '/my',
  authenticate,
  authorize('CLIENT', 'ADMIN'),
  (req, res, next) => bookingController.getMyBookings(req, res, next)
);

router.get(
  '/barber/my',
  authenticate,
  authorize('BARBER', 'ADMIN'),
  (req, res, next) => bookingController.getMyBarberBookings(req, res, next)
);

router.get(
  '/shop/:shopId',
  authenticate,
  authorize('OWNER', 'BARBER', 'ADMIN'),
  (req, res, next) => bookingController.getBookingsForShop(req, res, next)
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('OWNER', 'BARBER', 'ADMIN'),
  validate([
    body('status')
      .notEmpty()
      .isIn([
        'PENDING',
        'CONFIRMED',
        'DEPOSIT_PAID',
        'CHECKED_IN',
        'IN_PROGRESS',
        'COMPLETED',
        'NO_SHOW',
        'CANCELLED',
      ])
      .withMessage('Invalid status'),
  ]),
  (req, res, next) => bookingController.updateStatus(req, res, next)
);

router.patch(
  '/:id/cancel',
  authenticate,
  authorize('CLIENT', 'ADMIN'),
  (req, res, next) => bookingController.cancelBooking(req, res, next)
);

router.patch(
  '/:id/checkin',
  authenticate,
  authorize('OWNER', 'BARBER', 'CLIENT', 'ADMIN'),
  (req, res, next) => bookingController.checkin(req, res, next)
);

export default router;
