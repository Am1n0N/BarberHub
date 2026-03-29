import { Router } from 'express';
import { body } from 'express-validator';
import { queueController } from '../controllers/queue.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('BARBER', 'OWNER', 'ADMIN'),
  validate([
    body('shopId').notEmpty().withMessage('Shop ID is required'),
    body('clientName').notEmpty().withMessage('Client name is required'),
  ]),
  (req, res, next) => queueController.addToQueue(req, res, next)
);

// Public route for TV display
router.get(
  '/shop/:shopId',
  (req, res, next) => queueController.getShopQueue(req, res, next)
);

router.patch(
  '/:id/start',
  authenticate,
  authorize('BARBER', 'OWNER', 'ADMIN'),
  (req, res, next) => queueController.startServing(req, res, next)
);

router.patch(
  '/:id/complete',
  authenticate,
  authorize('BARBER', 'OWNER', 'ADMIN'),
  (req, res, next) => queueController.completeService(req, res, next)
);

router.patch(
  '/:id/cancel',
  authenticate,
  authorize('BARBER', 'OWNER', 'ADMIN'),
  (req, res, next) => queueController.cancelEntry(req, res, next)
);

router.delete(
  '/shop/:shopId/clear',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  (req, res, next) => queueController.clearCompleted(req, res, next)
);

export default router;
