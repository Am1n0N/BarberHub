import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  phone: string;
  name: string;
  role: 'CLIENT' | 'BARBER' | 'OWNER' | 'ADMIN';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ApiError extends Error {
  statusCode?: number;
  errors?: Array<{ field: string; message: string }>;
}

export type AsyncHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface QueueUpdatePayload {
  shopId: string;
  queue: Array<{
    id: string;
    clientName: string;
    position: number;
    status: string;
    estimatedWaitMin: number;
  }>;
}

export interface DailyPayoutSummary {
  barberId: string;
  barberName: string;
  totalRevenue: number;
  barberShare: number;
  ownerShare: number;
  completedServices: number;
}
