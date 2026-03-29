import { Router } from 'express';
import { body } from 'express-validator';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Shops
router.get('/shops', (req, res, next) => adminController.listShops(req, res, next));

router.post(
  '/shops',
  validate([
    body('ownerName').notEmpty().withMessage('Owner name is required'),
    body('ownerPhone').notEmpty().withMessage('Owner phone is required'),
    body('ownerPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('shopName').notEmpty().withMessage('Shop name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('phone').notEmpty().withMessage('Shop phone is required'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  ]),
  (req, res, next) => adminController.createShop(req, res, next)
);

router.patch('/shops/:id/toggle', (req, res, next) => adminController.toggleShopStatus(req, res, next));

// Join requests
router.get('/requests', (req, res, next) => adminController.listRequests(req, res, next));

router.patch(
  '/requests/:id/review',
  validate([
    body('action')
      .isIn(['APPROVED', 'REJECTED'])
      .withMessage('Action must be APPROVED or REJECTED'),
    body('ownerPassword')
      .if(body('action').equals('APPROVED'))
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ]),
  (req, res, next) => adminController.reviewRequest(req, res, next)
);

export default router;
