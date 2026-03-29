import { Router } from 'express';
import { body } from 'express-validator';
import { shopController } from '../controllers/shop.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  validate([
    body('name').notEmpty().withMessage('Shop name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
  ]),
  (req, res, next) => shopController.createShop(req, res, next)
);

router.get(
  '/:slug',
  (req, res, next) => shopController.getShopBySlug(req, res, next)
);

router.put(
  '/:id',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  (req, res, next) => shopController.updateShop(req, res, next)
);

router.get(
  '/:id/barbers',
  (req, res, next) => shopController.getBarbers(req, res, next)
);

router.post(
  '/:id/barbers',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  validate([
    body('userId').notEmpty().withMessage('User ID is required'),
    body('commissionRate')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('Commission rate must be between 0 and 1'),
  ]),
  (req, res, next) => shopController.addBarber(req, res, next)
);

router.post(
  '/:id/services',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  validate([
    body('nameDerja').notEmpty().withMessage('Derja name is required'),
    body('nameFr').notEmpty().withMessage('French name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('durationMin')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
  ]),
  (req, res, next) => shopController.addService(req, res, next)
);

router.get(
  '/:id/services',
  (req, res, next) => shopController.getServices(req, res, next)
);

export default router;
