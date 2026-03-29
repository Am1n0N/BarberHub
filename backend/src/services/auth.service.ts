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
      },
      token,
    };
  }

  async login(phone: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { phone },
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
        role: user.role,
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
