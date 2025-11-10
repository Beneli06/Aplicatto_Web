import createHttpError from 'http-errors';
import type { NextFunction, Request, Response } from 'express';

import type { UserRole } from '../models/user.model';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      return next(createHttpError(401, 'Autenticación requerida'));
    }

    if (!roles.includes(user.role)) {
      return next(createHttpError(403, 'No tienes permisos para realizar esta acción'));
    }

    next();
  };
}
