import { PrismaClient, Prisma } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { generateSlug } from '../utils/helpers';
import { notifyOwnerApproved, NotificationResult } from './notification.service';

const prisma = new PrismaClient();

export class AdminService {
  // ── Shops ──────────────────────────────────────────────────────────────────

  async listAllShops(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, phone: true } },
          _count: { select: { barbers: true, bookings: true } },
        },
      }),
      prisma.shop.count(),
    ]);
    return { shops, total, page, limit };
  }

  async createShopWithOwner(data: {
    ownerName: string;
    ownerPhone: string;
    ownerPassword: string;
    shopName: string;
    address: string;
    city: string;
    phone: string;
    latitude?: number;
    longitude?: number;
    openingHours?: Record<string, unknown>;
  }) {
    // Check phone not already used
    const existingUser = await prisma.user.findUnique({ where: { phone: data.ownerPhone } });
    if (existingUser) {
      throw Object.assign(new Error('Phone number already registered'), { statusCode: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.ownerPassword, 10);

    let slug = generateSlug(data.shopName);
    const slugExists = await prisma.shop.findUnique({ where: { slug } });
    if (slugExists) slug = `${slug}-${Date.now()}`;

    // Create user and shop in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: data.ownerPhone,
          name: data.ownerName,
          password: hashedPassword,
          role: 'OWNER',
        },
      });

      const shop = await tx.shop.create({
        data: {
          name: data.shopName,
          slug,
          address: data.address,
          city: data.city,
          phone: data.phone,
          ownerId: user.id,
          latitude: data.latitude,
          longitude: data.longitude,
          openingHours: data.openingHours as Prisma.InputJsonValue ?? undefined,
        },
        include: { owner: { select: { id: true, name: true, phone: true } } },
      });

      return { user: { id: user.id, name: user.name, phone: user.phone, role: user.role }, shop };
    });

    return result;
  }

  async toggleShopStatus(shopId: string) {
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw Object.assign(new Error('Shop not found'), { statusCode: 404 });

    return prisma.shop.update({
      where: { id: shopId },
      data: { isActive: !shop.isActive },
    });
  }

  // ── Join Requests ──────────────────────────────────────────────────────────

  async listRequests(status?: 'PENDING' | 'APPROVED' | 'REJECTED', page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [requests, total] = await Promise.all([
      prisma.shopRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shopRequest.count({ where }),
    ]);
    return { requests, total, page, limit };
  }

  async submitJoinRequest(data: {
    ownerName: string;
    ownerPhone: string;
    ownerEmail?: string;
    shopName: string;
    address: string;
    city: string;
    message?: string;
  }) {
    // Prevent duplicate pending requests from same phone
    const existing = await prisma.shopRequest.findFirst({
      where: { ownerPhone: data.ownerPhone, status: 'PENDING' },
    });
    if (existing) {
      throw Object.assign(new Error('A pending request already exists for this phone number'), {
        statusCode: 409,
      });
    }

    return prisma.shopRequest.create({ data });
  }

  async reviewRequest(
    requestId: string,
    action: 'APPROVED' | 'REJECTED',
    options: { reviewNote?: string; ownerPassword?: string } = {}
  ) {
    const request = await prisma.shopRequest.findUnique({ where: { id: requestId } });
    if (!request) throw Object.assign(new Error('Request not found'), { statusCode: 404 });
    if (request.status !== 'PENDING') {
      throw Object.assign(new Error('Request already reviewed'), { statusCode: 409 });
    }

    let notification: NotificationResult | null = null;

    if (action === 'APPROVED') {
      const password = options.ownerPassword ?? crypto.randomBytes(6).toString('base64url').slice(0, 8);
      await this.createShopWithOwner({
        ownerName: request.ownerName,
        ownerPhone: request.ownerPhone,
        ownerPassword: password,
        shopName: request.shopName,
        address: request.address,
        city: request.city,
        phone: request.ownerPhone,
      });

      // Send credentials to the owner (email + WhatsApp)
      notification = await notifyOwnerApproved({
        ownerName: request.ownerName,
        ownerPhone: request.ownerPhone,
        ownerEmail: request.ownerEmail,
        shopName: request.shopName,
        password,
      });
    }

    const updated = await prisma.shopRequest.update({
      where: { id: requestId },
      data: {
        status: action,
        reviewNote: options.reviewNote ?? null,
        reviewedAt: new Date(),
      },
    });

    return { ...updated, notification };
  }
}

export const adminService = new AdminService();
