import createHttpError from 'http-errors';
import type { Request, Response, NextFunction } from 'express';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(createHttpError(404, 'Recurso no encontrado'));
}
