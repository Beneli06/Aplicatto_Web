import { env } from './config/env';
import { connectMongo, disconnectMongo } from './db/connection';
import { app } from './app';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  try {
    await connectMongo();

    const server = app.listen(env.port, () => {
      logger.info(`Servidor escuchando en http://localhost:${env.port}`);
    });

    const shutdown = (signal: string) => {
      logger.info(`Recibida señal ${signal}, cerrando servidor...`);
      server.close(async () => {
        logger.info('Servidor cerrado. Cerrando conexión con MongoDB...');
        await disconnectMongo();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Fallo iniciando el servidor', error);
    process.exit(1);
  }
}

void bootstrap();
