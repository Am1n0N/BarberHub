import { Router } from 'express';
import { body } from 'express-validator';
import { shopController } from '../controllers/shop.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthRequest } from '../types';

const router = Router();

router.get(
  '/',
  (req, res, next) => shopController.listShops(req as AuthRequest, res, next)
);

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
    body('name').notEmpty().withMessage('Barber name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('password')
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('email').optional({ nullable: true }).isEmail().withMessage('Invalid email address'),
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

router.patch(
  '/:id/services/:serviceId',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  (req, res, next) => shopController.updateService(req as any, res, next)
);

router.delete(
  '/:id/services/:serviceId',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  (req, res, next) => shopController.deleteService(req as any, res, next)
);

router.get(
  '/:id/services',
  (req, res, next) => shopController.getServices(req, res, next)
);

router.patch(
  '/:id/barbers/:barberId',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  (req, res, next) => shopController.updateBarber(req as any, res, next)
);

router.patch(
  '/:id/barbers/:barberId/toggle-availability',
  authenticate,
  authorize('OWNER', 'ADMIN'),
  (req, res, next) => shopController.toggleBarberAvailability(req as any, res, next)
);

export default router;
