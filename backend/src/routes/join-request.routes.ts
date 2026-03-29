import { Router } from 'express';
import { body } from 'express-validator';
import { adminController } from '../controllers/admin.controller';
import { validate } from '../middleware/validate';

const router = Router();

// Public: anyone can submit a join request
router.post(
  '/',
  validate([
    body('ownerName').notEmpty().withMessage('Your name is required'),
    body('ownerPhone').notEmpty().withMessage('Your phone number is required'),
    body('ownerEmail').optional().isEmail().withMessage('Invalid email address'),
    body('shopName').notEmpty().withMessage('Shop name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('message').optional().isLength({ max: 500 }).withMessage('Message must be under 500 characters'),
  ]),
  (req, res, next) => adminController.submitJoinRequest(req, res, next)
);

export default router;
