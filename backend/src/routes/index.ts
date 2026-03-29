import { Router } from 'express';
import authRoutes from './auth.routes';
import shopRoutes from './shop.routes';
import bookingRoutes from './booking.routes';
import queueRoutes from './queue.routes';
import payoutRoutes from './payout.routes';
import adminRoutes from './admin.routes';
import joinRequestRoutes from './join-request.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/shops', shopRoutes);
router.use('/bookings', bookingRoutes);
router.use('/queue', queueRoutes);
router.use('/payouts', payoutRoutes);
router.use('/admin', adminRoutes);
router.use('/join-requests', joinRequestRoutes);

export default router;
