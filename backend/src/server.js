'use strict';

const env = require('./config/env');
const logger = require('./config/logger');
const { sequelize } = require('./config/database');
const { createApp } = require('./app');
require('./models');
const { runAll: runSeeders } = require('./db/seeders');

async function bootstrap() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');

    if (env.nodeEnv !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Sequelize models synchronized');
      await runSeeders();
    }

    const app = createApp();
    const server = app.listen(env.port, () => {
      logger.info(`PeoplePay360 backend listening on port ${env.port} (${env.nodeEnv})`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down...`);
      server.close(async () => {
        try {
          await sequelize.close();
          logger.info('Database connection closed. Bye.');
          process.exit(0);
        } catch (err) {
          logger.error(err);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('unhandledRejection', (err) => logger.error('unhandledRejection: %o', err));
    process.on('uncaughtException', (err) => logger.error('uncaughtException: %o', err));
  } catch (err) {
    logger.error('Failed to start server: %o', err);
    process.exit(1);
  }
}

bootstrap();
