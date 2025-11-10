import './load-env';

import { Joi } from 'celebrate';

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(4001),
  MONGODB_URI: Joi.string().uri().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  ACCESS_TOKEN_TTL_MINUTES: Joi.number().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: Joi.number().positive().default(7)
}).unknown(true);

const { value, error } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`Invalid environment configuration: ${error.message}`);
}

export const env = {
  nodeEnv: value.NODE_ENV as string,
  port: value.PORT as number,
  mongoUri: value.MONGODB_URI as string,
  accessTokenSecret: value.JWT_ACCESS_SECRET as string,
  refreshTokenSecret: value.JWT_REFRESH_SECRET as string,
  accessTokenTtlMinutes: value.ACCESS_TOKEN_TTL_MINUTES as number,
  refreshTokenTtlDays: value.REFRESH_TOKEN_TTL_DAYS as number
};
