import { Router } from 'express';
import authRoutes from './auth.routes';
import shopRoutes from './shop.routes';
import bookingRoutes from './booking.routes';
import queueRoutes from './queue.routes';
import payoutRoutes from './payout.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/shops', shopRoutes);
router.use('/bookings', bookingRoutes);
router.use('/queue', queueRoutes);
router.use('/payouts', payoutRoutes);

export default router;
