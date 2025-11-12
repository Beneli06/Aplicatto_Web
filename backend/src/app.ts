import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { errors as celebrateErrors } from 'celebrate';

import { env } from './config/env';
import { notFoundHandler } from './middleware/not-found';
import { errorHandler } from './middleware/error-handler';
import { apiRouter } from './routes';

const app = express();

app.disable('x-powered-by');

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
    crossOriginEmbedderPolicy: false
  })
);
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));

const allowedOrigins = new Set(env.clientOrigins);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
    maxAge: 86400
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  })
);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: 'v1',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', apiRouter);

app.use(celebrateErrors());
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
