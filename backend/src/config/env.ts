import './load-env';

import { Joi } from 'celebrate';

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(4001),
  MONGODB_URI: Joi.string().uri().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  ACCESS_TOKEN_TTL_MINUTES: Joi.number().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: Joi.number().positive().default(7),
  CLIENT_ORIGINS: Joi.string().required(),
  COOKIE_DOMAIN: Joi.string().allow('', null).optional(),
  COOKIE_SAMESITE: Joi.string().valid('lax', 'strict', 'none').default('lax'),
  COOKIE_SECURE_MODE: Joi.string().valid('auto', 'always', 'never').default('auto')
}).unknown(true);

const { value, error } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`Invalid environment configuration: ${error.message}`);
}

const clientOrigins = (value.CLIENT_ORIGINS as string)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (clientOrigins.length === 0) {
  throw new Error('CLIENT_ORIGINS must include at least one origin.');
}

const resolveCookieSecure = (mode: string, nodeEnv: string): boolean => {
  if (mode === 'always') return true;
  if (mode === 'never') return false;
  return nodeEnv === 'production';
};

const cookieSecure = resolveCookieSecure(value.COOKIE_SECURE_MODE as string, value.NODE_ENV as string);
const cookieSameSite = value.COOKIE_SAMESITE as 'lax' | 'strict' | 'none';

if (cookieSameSite === 'none' && !cookieSecure) {
  throw new Error('COOKIE_SAMESITE="none" requires secure cookies. Enable HTTPS or adjust COOKIE_SECURE_MODE.');
}

export const env = {
  nodeEnv: value.NODE_ENV as string,
  port: value.PORT as number,
  mongoUri: value.MONGODB_URI as string,
  accessTokenSecret: value.JWT_ACCESS_SECRET as string,
  refreshTokenSecret: value.JWT_REFRESH_SECRET as string,
  accessTokenTtlMinutes: value.ACCESS_TOKEN_TTL_MINUTES as number,
  refreshTokenTtlDays: value.REFRESH_TOKEN_TTL_DAYS as number,
  clientOrigins,
  cookie: {
    secure: cookieSecure,
    sameSite: cookieSameSite,
    domain: value.COOKIE_DOMAIN ? String(value.COOKIE_DOMAIN) || undefined : undefined
  }
};
