import { PrismaClient } from '@prisma/client';
import { emitQueueUpdate } from '../config/socket';
import { calculateEstimatedWait } from '../utils/helpers';

const prisma = new PrismaClient();

export class QueueService {
  async addToQueue(data: {
    shopId: string;
    clientId?: string;
    barberId?: string;
    serviceId?: string;
    clientName: string;
  }) {
    const shop = await prisma.shop.findUnique({ where: { id: data.shopId } });
    if (!shop) {
      throw Object.assign(new Error('Shop not found'), { statusCode: 404 });
    }

    const maxPos = await prisma.queueEntry.aggregate({
      where: {
        shopId: data.shopId,
        status: { in: ['WAITING', 'IN_PROGRESS'] },
      },
      _max: { position: true },
    });

    const position = (maxPos._max.position ?? 0) + 1;

    const entry = await prisma.queueEntry.create({
      data: {
        shopId: data.shopId,
        clientId: data.clientId ?? null,
        barberId: data.barberId ?? null,
        serviceId: data.serviceId ?? null,
        clientName: data.clientName,
        position,
        type: 'WALK_IN',
        status: 'WAITING',
      },
      include: {
        service: true,
        barber: { include: { user: { select: { name: true } } } },
      },
    });

    await this.broadcastQueueUpdate(data.shopId);

    return entry;
  }

  async getShopQueue(shopId: string) {
    const entries = await prisma.queueEntry.findMany({
      where: {
        shopId,
        status: { in: ['WAITING', 'IN_PROGRESS'] },
      },
      include: {
        service: true,
        barber: { include: { user: { select: { name: true } } } },
      },
      orderBy: { position: 'asc' },
    });

    const avgDuration = await this.getAverageServiceDuration(shopId);

    return entries.map((entry, index) => ({
      ...entry,
      estimatedWaitMin:
        entry.status === 'IN_PROGRESS'
          ? 0
          : calculateEstimatedWait(index, avgDuration),
    }));
  }

  async startServing(id: string) {
    const entry = await prisma.queueEntry.findUnique({ where: { id } });

    if (!entry) {
      throw Object.assign(new Error('Queue entry not found'), {
        statusCode: 404,
      });
    }

    const updated = await prisma.queueEntry.update({
      where: { id },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
    });

    await this.broadcastQueueUpdate(entry.shopId);

    return updated;
  }

  async completeService(id: string) {
    const entry = await prisma.queueEntry.findUnique({ where: { id } });

    if (!entry) {
      throw Object.assign(new Error('Queue entry not found'), {
        statusCode: 404,
      });
    }

    const updated = await prisma.queueEntry.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    await this.recalculatePositions(entry.shopId);
    await this.broadcastQueueUpdate(entry.shopId);

    return updated;
  }

  async cancelEntry(id: string) {
    const entry = await prisma.queueEntry.findUnique({ where: { id } });

    if (!entry) {
      throw Object.assign(new Error('Queue entry not found'), {
        statusCode: 404,
      });
    }

    const updated = await prisma.queueEntry.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.recalculatePositions(entry.shopId);
    await this.broadcastQueueUpdate(entry.shopId);

    return updated;
  }

  async clearCompleted(shopId: string) {
    const result = await prisma.queueEntry.deleteMany({
      where: {
        shopId,
        status: { in: ['COMPLETED', 'CANCELLED'] },
      },
    });

    await this.broadcastQueueUpdate(shopId);

    return { cleared: result.count };
  }

  private async recalculatePositions(shopId: string): Promise<void> {
    const activeEntries = await prisma.queueEntry.findMany({
      where: {
        shopId,
        status: { in: ['WAITING', 'IN_PROGRESS'] },
      },
      orderBy: { position: 'asc' },
    });

    await prisma.$transaction(
      activeEntries.map((entry, i) =>
        prisma.queueEntry.update({
          where: { id: entry.id },
          data: { position: i + 1 },
        })
      )
    );
  }

  private async getAverageServiceDuration(shopId: string): Promise<number> {
    const avgResult = await prisma.service.aggregate({
      where: { shopId, isActive: true },
      _avg: { durationMin: true },
    });

    return avgResult._avg.durationMin ?? 30;
  }

  private async broadcastQueueUpdate(shopId: string): Promise<void> {
    try {
      const queue = await this.getShopQueue(shopId);
      emitQueueUpdate(shopId, queue);
    } catch {
      // Socket might not be initialized in tests
    }
  }
}

export const queueService = new QueueService();
