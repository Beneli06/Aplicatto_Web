import createHttpError from 'http-errors';
import type { Request, Response, NextFunction, CookieOptions } from 'express';

import {
  loginUser,
  logoutUser,
  refreshTokens,
  registerUser
} from '../services/auth.service';
import { env } from '../config/env';

const REFRESH_COOKIE_NAME = 'refreshToken';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.cookie.sameSite,
  domain: env.cookie.domain,
  path: '/',
  maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, tokens } = await registerUser(req.body);

    res
      .cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, refreshCookieOptions)
      .status(201)
      .json({ user, accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, tokens } = await loginUser(req.body);

    res
      .cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, refreshCookieOptions)
      .json({ user, accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = (req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined) ?? req.body?.refreshToken;

    if (!refreshToken) {
      throw createHttpError(400, 'Token de actualización requerido');
    }

    const { user, tokens } = await refreshTokens(refreshToken);

    res
      .cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, refreshCookieOptions)
      .json({ user, accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as Request & { user?: { id?: string } }).user?.id;

    if (!userId) {
      throw createHttpError(401, 'No se encontró información de usuario en la sesión');
    }

    await logoutUser(userId);
    res
      .clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions, maxAge: undefined })
      .status(204)
      .send();
  } catch (error) {
    next(error);
  }
}
