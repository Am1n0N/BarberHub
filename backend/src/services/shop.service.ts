import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateSlug } from '../utils/helpers';
import { notifyBarberCreated, NotificationResult } from './notification.service';

const prisma = new PrismaClient();

export class ShopService {
  async listShops() {
    const shops = await prisma.shop.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        phone: true,
        latitude: true,
        longitude: true,
        openingHours: true,
        isActive: true,
      },
    });
    return shops;
  }

  async createShop(data: {
    name: string;
    address: string;
    city: string;
    phone: string;
    ownerId: string;
    openingHours?: Record<string, unknown>;
    latitude?: number;
    longitude?: number;
  }) {
    const existing = await prisma.shop.findUnique({
      where: { ownerId: data.ownerId },
    });

    if (existing) {
      throw Object.assign(new Error('Owner already has a shop'), {
        statusCode: 409,
      });
    }

    let slug = generateSlug(data.name);

    const slugExists = await prisma.shop.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    const shop = await prisma.shop.create({
      data: {
        name: data.name,
        slug,
        address: data.address,
        city: data.city,
        phone: data.phone,
        ownerId: data.ownerId,
        openingHours: data.openingHours as Prisma.InputJsonValue ?? undefined,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      include: { owner: { select: { id: true, name: true, phone: true } } },
    });

    return shop;
  }

  async getShopBySlug(slug: string) {
    const shop = await prisma.shop.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, name: true, phone: true } },
        barbers: {
          include: { user: { select: { id: true, name: true, phone: true } } },
        },
        services: { where: { isActive: true } },
      },
    });

    if (!shop) {
      throw Object.assign(new Error('Shop not found'), { statusCode: 404 });
    }

    return shop;
  }

  async updateShop(
    id: string,
    ownerId: string,
    data: {
      name?: string;
      address?: string;
      city?: string;
      phone?: string;
      openingHours?: Record<string, unknown>;
      tvDisplayUrl?: string;
      isActive?: boolean;
      latitude?: number;
      longitude?: number;
    }
  ) {
    const shop = await prisma.shop.findUnique({ where: { id } });

    if (!shop) {
      throw Object.assign(new Error('Shop not found'), { statusCode: 404 });
    }

    if (shop.ownerId !== ownerId) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    }

    const updateData: Prisma.ShopUpdateInput = {
      ...data,
      openingHours: data.openingHours as Prisma.InputJsonValue ?? undefined,
    };

    const updated = await prisma.shop.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  async getBarbers(shopId: string) {
    const barbers = await prisma.barber.findMany({
      where: { shopId },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });

    // Map user.name to barber.name
    return barbers.map((barber) => ({
      ...barber,
      name: barber.user.name,
      phone: barber.user.phone,
    }));
  }

  async addBarber(
    shopId: string,
    ownerId: string,
    data: {
      name: string;
      phone: string;
      password: string;
      email?: string | null;
      commissionRate?: number;
    }
  ): Promise<{ barber: Record<string, unknown>; notification: NotificationResult }> {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });

    if (!shop) {
      throw Object.assign(new Error('Shop not found'), { statusCode: 404 });
    }

    if (shop.ownerId !== ownerId) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    }

    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) {
      throw Object.assign(new Error('Phone number already registered'), { statusCode: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        name: data.name,
        email: data.email ?? null,
        password: hashedPassword,
        role: 'BARBER',
      },
    });

    const barber = await prisma.barber.create({
      data: {
        userId: user.id,
        shopId,
        commissionRate: data.commissionRate ?? 0.5,
      },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });

    const notification = await notifyBarberCreated({
      barberName: data.name,
      barberPhone: data.phone,
      barberEmail: data.email,
      shopName: shop.name,
      password: data.password,
    });

    return {
      barber: {
        ...barber,
        name: barber.user.name,
        phone: barber.user.phone,
      },
      notification,
    };
  }

  async addService(
    shopId: string,
    ownerId: string,
    data: {
      nameDerja: string;
      nameFr: string;
      price: number;
      durationMin?: number;
    }
  ) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });

    if (!shop) {
      throw Object.assign(new Error('Shop not found'), { statusCode: 404 });
    }

    if (shop.ownerId !== ownerId) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    }

    const service = await prisma.service.create({
      data: {
        shopId,
        nameDerja: data.nameDerja,
        nameFr: data.nameFr,
        price: data.price,
        durationMin: data.durationMin ?? 30,
      },
    });

    return service;
  }

  async getServices(shopId: string) {
    const services = await prisma.service.findMany({
      where: { shopId, isActive: true },
    });

    return services;
  }

  async updateService(serviceId: string, ownerId: string, data: { nameDerja?: string; nameFr?: string; price?: number; durationMin?: number; isActive?: boolean }) {
    const service = await prisma.service.findUnique({ where: { id: serviceId }, include: { shop: { select: { ownerId: true } } } });
    if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 });
    if (service.shop.ownerId !== ownerId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    return prisma.service.update({ where: { id: serviceId }, data });
  }

  async deleteService(serviceId: string, ownerId: string) {
    const service = await prisma.service.findUnique({ where: { id: serviceId }, include: { shop: { select: { ownerId: true } } } });
    if (!service) throw Object.assign(new Error('Service not found'), { statusCode: 404 });
    if (service.shop.ownerId !== ownerId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    return prisma.service.update({ where: { id: serviceId }, data: { isActive: false } });
  }

  async updateBarber(barberId: string, ownerId: string, data: { commissionRate?: number }) {
    const barber = await prisma.barber.findUnique({ where: { id: barberId }, include: { shop: { select: { ownerId: true } } } });
    if (!barber) throw Object.assign(new Error('Barber not found'), { statusCode: 404 });
    if (barber.shop.ownerId !== ownerId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    return prisma.barber.update({ where: { id: barberId }, data, include: { user: { select: { id: true, name: true, phone: true } } } });
  }

  async toggleBarberAvailability(barberId: string, ownerId: string) {
    const barber = await prisma.barber.findUnique({ where: { id: barberId }, include: { shop: { select: { ownerId: true } } } });
    if (!barber) throw Object.assign(new Error('Barber not found'), { statusCode: 404 });
    if (barber.shop.ownerId !== ownerId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    return prisma.barber.update({ where: { id: barberId }, data: { isAvailable: !barber.isAvailable }, include: { user: { select: { id: true, name: true, phone: true } } } });
  }
}

export const shopService = new ShopService();
