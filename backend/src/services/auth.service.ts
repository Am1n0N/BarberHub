import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: {
    phone: string;
    name: string;
    role?: 'CLIENT' | 'BARBER' | 'OWNER' | 'ADMIN';
    password?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (existing) {
      throw Object.assign(new Error('Phone number already registered'), {
        statusCode: 409,
      });
    }

    if (!data.password) {
      throw Object.assign(new Error('Password is required'), {
        statusCode: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        name: data.name,
        password: hashedPassword,
        role: data.role || 'CLIENT',
      },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        shop: undefined,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        shop: { select: { id: true, name: true, slug: true } },
        barber: {
          select: {
            id: true,
            shopId: true,
            isAvailable: true,
            commissionRate: true,
            shop: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email ?? undefined,
      role: user.role,
      shop: user.shop ?? user.barber?.shop ?? undefined,
      barber: user.barber
        ? { id: user.barber.id, isAvailable: user.barber.isAvailable, commissionRate: user.barber.commissionRate }
        : undefined,
    };
  }

  async login(phone: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        shop: { select: { id: true, name: true, slug: true } },
        barber: {
          select: {
            id: true,
            shopId: true,
            isAvailable: true,
            commissionRate: true,
            shop: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!user) {
      throw Object.assign(new Error('Invalid credentials'), {
        statusCode: 401,
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw Object.assign(new Error('Invalid credentials'), {
        statusCode: 401,
      });
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email ?? undefined,
        role: user.role,
        shop: user.shop ?? user.barber?.shop ?? undefined,
        barber: user.barber
          ? { id: user.barber.id, isAvailable: user.barber.isAvailable, commissionRate: user.barber.commissionRate }
          : undefined,
      },
      token,
    };
  }

  private generateToken(user: { id: string; phone: string; name: string; role: string }): string {
    return jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );
  }
}

export const authService = new AuthService();
