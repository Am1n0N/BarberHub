import { Router } from 'express';
import { body } from 'express-validator';
import { bookingController } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('CLIENT', 'ADMIN'),
  validate([
    body('shopId').notEmpty().withMessage('Shop ID is required'),
    body('barberId').notEmpty().withMessage('Barber ID is required'),
    body('serviceId').notEmpty().withMessage('Service ID is required'),
    body('date').notEmpty().isISO8601().withMessage('Valid date is required'),
    body('timeSlot').notEmpty().withMessage('Time slot is required'),
  ]),
  (req, res, next) => bookingController.createBooking(req, res, next)
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
  '/:id/checkin',
  authenticate,
  authorize('OWNER', 'BARBER', 'CLIENT', 'ADMIN'),
  (req, res, next) => bookingController.checkin(req, res, next)
);

export default router;
