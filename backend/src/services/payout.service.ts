import { PrismaClient } from '@prisma/client';
import { todayRange } from '../utils/helpers';
import { DailyPayoutSummary } from '../types';

const prisma = new PrismaClient();

export class PayoutService {
  async getDailyPayoutSummary(shopId: string, date?: string): Promise<DailyPayoutSummary[]> {
    let start: Date;
    let end: Date;

    if (date) {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    } else {
      const range = todayRange();
      start = range.start;
      end = range.end;
    }

    const barbers = await prisma.barber.findMany({
      where: { shopId },
      include: { user: { select: { name: true } } },
    });

    const summaries: DailyPayoutSummary[] = [];

    // Fetch all completed entries for the shop in one query to avoid N+1
    const allCompletedEntries = await prisma.queueEntry.findMany({
      where: {
        shopId,
        status: 'COMPLETED',
        completedAt: { gte: start, lte: end },
        barberId: { not: null },
      },
      include: { service: true },
    });

    // Group entries by barberId using a Map for O(n) lookup instead of filtering per barber
    const entriesByBarber = new Map<string, typeof allCompletedEntries>();
    for (const entry of allCompletedEntries) {
      if (entry.barberId) {
        const existing = entriesByBarber.get(entry.barberId) ?? [];
        existing.push(entry);
        entriesByBarber.set(entry.barberId, existing);
      }
    }

    for (const barber of barbers) {
      const completedEntries = entriesByBarber.get(barber.id) ?? [];

      const totalRevenue = completedEntries.reduce((sum, entry) => {
        return sum + (entry.service?.price ?? 0);
      }, 0);

      const barberShare = totalRevenue * barber.commissionRate;
      const ownerShare = totalRevenue - barberShare;

      summaries.push({
        barberId: barber.id,
        barberName: barber.user.name,
        totalRevenue,
        barberShare,
        ownerShare,
        completedServices: completedEntries.length,
      });
    }

    // Upsert payout records
    for (const summary of summaries) {
      const existing = await prisma.payout.findFirst({
        where: {
          barberId: summary.barberId,
          date: { gte: start, lte: end },
        },
      });

      if (existing) {
        await prisma.payout.update({
          where: { id: existing.id },
          data: {
            totalRevenue: summary.totalRevenue,
            barberShare: summary.barberShare,
            ownerShare: summary.ownerShare,
          },
        });
      } else if (summary.totalRevenue > 0) {
        await prisma.payout.create({
          data: {
            barberId: summary.barberId,
            date: start,
            totalRevenue: summary.totalRevenue,
            barberShare: summary.barberShare,
            ownerShare: summary.ownerShare,
          },
        });
      }
    }

    return summaries;
  }

  async getBarberPayouts(barberId: string) {
    const payouts = await prisma.payout.findMany({
      where: { barberId },
      orderBy: { date: 'desc' },
    });

    return payouts;
  }

  async markPaid(id: string, paidVia?: string) {
    const payout = await prisma.payout.findUnique({ where: { id } });

    if (!payout) {
      throw Object.assign(new Error('Payout not found'), { statusCode: 404 });
    }

    const updated = await prisma.payout.update({
      where: { id },
      data: {
        isPaid: true,
        paidVia: paidVia ?? null,
      },
    });

    return updated;
  }
}

export const payoutService = new PayoutService();
