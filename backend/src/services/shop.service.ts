import { PrismaClient, Prisma } from '@prisma/client';
import { generateSlug } from '../utils/helpers';

const prisma = new PrismaClient();

export class ShopService {
  async createShop(data: {
    name: string;
    address: string;
    city: string;
    phone: string;
    ownerId: string;
    openingHours?: Record<string, unknown>;
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

    return barbers;
  }

  async addBarber(shopId: string, ownerId: string, userId: string, commissionRate?: number) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });

    if (!shop) {
      throw Object.assign(new Error('Shop not found'), { statusCode: 404 });
    }

    if (shop.ownerId !== ownerId) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: 'BARBER' },
    });

    const barber = await prisma.barber.create({
      data: {
        userId,
        shopId,
        commissionRate: commissionRate ?? 0.5,
      },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });

    return barber;
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
}

export const shopService = new ShopService();
