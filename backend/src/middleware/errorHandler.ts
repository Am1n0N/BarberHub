import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function createError(
  message: string,
  statusCode: number = 500
): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  return error;
}
