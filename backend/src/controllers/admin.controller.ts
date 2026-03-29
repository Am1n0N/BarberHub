import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { adminService } from '../services/admin.service';

export class AdminController {
  // ── Shops ──────────────────────────────────────────────────────────────────

  async listShops(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await adminService.listAllShops(page, limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async createShop(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        ownerName, ownerPhone, ownerPassword,
        shopName, address, city, phone,
        latitude, longitude, openingHours,
      } = req.body;
      const result = await adminService.createShopWithOwner({
        ownerName,
        ownerPhone,
        ownerPassword,
        shopName,
        address,
        city,
        phone,
        latitude: latitude !== undefined ? Number(latitude) : undefined,
        longitude: longitude !== undefined ? Number(longitude) : undefined,
        openingHours,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async toggleShopStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const shop = await adminService.toggleShopStatus(req.params.id as string);
      res.json(shop);
    } catch (err) {
      next(err);
    }
  }

  // ── Join Requests ──────────────────────────────────────────────────────────

  async listRequests(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await adminService.listRequests(status, page, limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async submitJoinRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ownerName, ownerPhone, ownerEmail, shopName, address, city, message } = req.body;
      const request = await adminService.submitJoinRequest({
        ownerName, ownerPhone, ownerEmail, shopName, address, city, message,
      });
      res.status(201).json(request);
    } catch (err) {
      next(err);
    }
  }

  async reviewRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { action, reviewNote, ownerPassword } = req.body;
      const result = await adminService.reviewRequest(req.params.id as string, action, {
        reviewNote,
        ownerPassword,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
