import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { queueService } from '../services/queue.service';

export class QueueController {
  async addToQueue(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shopId, clientId, barberId, serviceId, clientName } = req.body;
      const entry = await queueService.addToQueue({
        shopId,
        clientId,
        barberId,
        serviceId,
        clientName,
      });
      res.status(201).json(entry);
    } catch (err) {
      next(err);
    }
  }

  async getShopQueue(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queue = await queueService.getShopQueue(req.params.shopId as string);
      res.json(queue);
    } catch (err) {
      next(err);
    }
  }

  async startServing(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await queueService.startServing(req.params.id as string);
      res.json(entry);
    } catch (err) {
      next(err);
    }
  }

  async completeService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await queueService.completeService(req.params.id as string);
      res.json(entry);
    } catch (err) {
      next(err);
    }
  }

  async cancelEntry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await queueService.cancelEntry(req.params.id as string);
      res.json(entry);
    } catch (err) {
      next(err);
    }
  }

  async clearCompleted(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await queueService.clearCompleted(req.params.shopId as string);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const queueController = new QueueController();
