import jwt from 'jsonwebtoken';

import { env } from '../config/env';

interface JwtPayload {
  sub: string;
  role: string;
  tokenVersion: number;
}

export function signAccessToken(userId: string, role: string, tokenVersion: number): string {
  return jwt.sign({ sub: userId, role, tokenVersion }, env.accessTokenSecret, {
    expiresIn: `${env.accessTokenTtlMinutes}m`
  });
}

export function signRefreshToken(userId: string, role: string, tokenVersion: number): string {
  return jwt.sign({ sub: userId, role, tokenVersion }, env.refreshTokenSecret, {
    expiresIn: `${env.refreshTokenTtlDays}d`
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.accessTokenSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.refreshTokenSecret) as JwtPayload;
}
