import createHttpError from 'http-errors';
import type { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../utils/jwt';
import { UserModel } from '../models/user.model';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw createHttpError(401, 'Autenticación requerida');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const payload = verifyAccessToken(token);

    const user = await UserModel.findById(payload.sub);
    if (!user) {
      throw createHttpError(401, 'Token inválido');
    }

    if (user.status === 'disabled') {
      throw createHttpError(403, 'La cuenta está deshabilitada');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw createHttpError(401, 'Token expirado, inicia sesión nuevamente');
    }

    req.user = {
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion
    };

    next();
  } catch (error) {
    next(error);
  }
}
