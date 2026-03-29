import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// PATCH /barbers/my/toggle-availability
// Barber toggles their own availability
router.patch(
  '/my/toggle-availability',
  authenticate,
  authorize('BARBER'),
  async (req: AuthRequest, res, next) => {
    try {
      const barber = await prisma.barber.findUnique({ where: { userId: req.user!.id } });
      if (!barber) {
        throw Object.assign(new Error('Barber profile not found'), { statusCode: 404 });
      }
      const updated = await prisma.barber.update({
        where: { id: barber.id },
        data: { isAvailable: !barber.isAvailable },
        include: { user: { select: { id: true, name: true, phone: true } } },
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// GET /barbers/my
// Barber gets their own profile
router.get(
  '/my',
  authenticate,
  authorize('BARBER'),
  async (req: AuthRequest, res, next) => {
    try {
      const barber = await prisma.barber.findUnique({
        where: { userId: req.user!.id },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          shop: { select: { id: true, name: true, slug: true, address: true, city: true, phone: true } },
        },
      });
      if (!barber) {
        throw Object.assign(new Error('Barber profile not found'), { statusCode: 404 });
      }
      res.json(barber);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
