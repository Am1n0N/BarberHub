import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { payoutService } from '../services/payout.service';

export class PayoutController {
  async getDailySummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = req.query.date as string | undefined;
      const summary = await payoutService.getDailyPayoutSummary(
        req.params.shopId as string,
        date
      );
      res.json(summary);
    } catch (err) {
      next(err);
    }
  }

  async getBarberPayouts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payouts = await payoutService.getBarberPayouts(req.params.barberId as string);
      res.json(payouts);
    } catch (err) {
      next(err);
    }
  }

  async markPaid(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paidVia } = req.body;
      const payout = await payoutService.markPaid(req.params.id as string, paidVia);
      res.json(payout);
    } catch (err) {
      next(err);
    }
  }
}

export const payoutController = new PayoutController();
