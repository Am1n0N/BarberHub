import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { shopService } from '../services/shop.service';

export class ShopController {
  async listShops(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const shops = await shopService.listShops();
      res.json(shops);
    } catch (err) {
      next(err);
    }
  }

  async createShop(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, address, city, phone, openingHours, latitude, longitude } = req.body;
      const shop = await shopService.createShop({
        name,
        address,
        city,
        phone,
        ownerId: req.user!.id,
        openingHours,
        latitude: latitude !== undefined ? Number(latitude) : undefined,
        longitude: longitude !== undefined ? Number(longitude) : undefined,
      });
      res.status(201).json(shop);
    } catch (err) {
      next(err);
    }
  }

  async getShopBySlug(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const shop = await shopService.getShopBySlug(req.params.slug as string);
      res.json(shop);
    } catch (err) {
      next(err);
    }
  }

  async updateShop(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const shop = await shopService.updateShop(
        req.params.id as string,
        req.user!.id,
        req.body
      );
      res.json(shop);
    } catch (err) {
      next(err);
    }
  }

  async getBarbers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const barbers = await shopService.getBarbers(req.params.id as string);
      res.json(barbers);
    } catch (err) {
      next(err);
    }
  }

  async addBarber(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, commissionRate } = req.body;
      const barber = await shopService.addBarber(
        req.params.id as string,
        req.user!.id,
        userId,
        commissionRate
      );
      res.status(201).json(barber);
    } catch (err) {
      next(err);
    }
  }

  async addService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nameDerja, nameFr, price, durationMin } = req.body;
      const service = await shopService.addService(req.params.id as string, req.user!.id, {
        nameDerja,
        nameFr,
        price,
        durationMin,
      });
      res.status(201).json(service);
    } catch (err) {
      next(err);
    }
  }

  async getServices(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await shopService.getServices(req.params.id as string);
      res.json(services);
    } catch (err) {
      next(err);
    }
  }

  async updateService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await shopService.updateService(req.params.serviceId as string, req.user!.id, req.body);
      res.json(service);
    } catch (err) {
      next(err);
    }
  }

  async deleteService(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await shopService.deleteService(req.params.serviceId as string, req.user!.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async updateBarber(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const barber = await shopService.updateBarber(req.params.barberId as string, req.user!.id, req.body);
      res.json(barber);
    } catch (err) {
      next(err);
    }
  }

  async toggleBarberAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const barber = await shopService.toggleBarberAvailability(req.params.barberId as string, req.user!.id);
      res.json(barber);
    } catch (err) {
      next(err);
    }
  }
}

export const shopController = new ShopController();
