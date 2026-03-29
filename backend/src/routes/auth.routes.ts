import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/register',
  validate([
    body('phone').notEmpty().withMessage('Phone is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('role')
      .optional()
      .isIn(['CLIENT', 'BARBER', 'OWNER', 'ADMIN'])
      .withMessage('Invalid role'),
    body('password')
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ]),
  (req, res, next) => authController.register(req, res, next)
);

router.post(
  '/login',
  validate([
    body('phone').notEmpty().withMessage('Phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  (req, res, next) => authController.login(req, res, next)
);

export default router;
