import type { NextFunction, Request, Response } from 'express';
import { isHttpError } from 'http-errors';

import { env } from '../config/env';
import { logger } from '../utils/logger';

interface ErrorResponse {
  status: number;
  message: string;
  details?: unknown;
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  let status = 500;
  let message = 'Error interno del servidor';
  let details: unknown;

  if (isHttpError(error)) {
    status = error.status ?? status;
    message = error.message;
    details = error.errors;
  }

  if (env.nodeEnv !== 'test') {
    logger.error('Error en solicitud HTTP', error);
  }

  const payload: ErrorResponse = { status, message };

  if (details && env.nodeEnv !== 'production') {
    payload.details = details;
  }

  res.status(status).json(payload);
}
