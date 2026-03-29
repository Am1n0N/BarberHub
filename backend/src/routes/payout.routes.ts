import { Router } from 'express';
import { body } from 'express-validator';
import { payoutController } from '../controllers/payout.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get(
  '/shop/:shopId/daily',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  (req, res, next) => payoutController.getDailySummary(req, res, next)
);

router.get(
  '/barber/:barberId',
  authenticate,
  authorize('BARBER', 'OWNER', 'ADMIN'),
  (req, res, next) => payoutController.getBarberPayouts(req, res, next)
);

router.post(
  '/:id/mark-paid',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  validate([
    body('paidVia')
      .optional()
      .isString()
      .withMessage('paidVia must be a string'),
  ]),
  (req, res, next) => payoutController.markPaid(req, res, next)
);

export default router;
