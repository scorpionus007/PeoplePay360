'use strict';

const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('./logger');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'postgres',
  logging: env.db.logging ? (msg) => logger.debug(msg) : false,
  pool: env.db.pool,
  define: {
    underscored: true,
    freezeTableName: false,
    timestamps: true,
    paranoid: false,
  },
});

async function connect() {
  await sequelize.authenticate();
  logger.info('Database connection established');
}

async function disconnect() {
  await sequelize.close();
  logger.info('Database connection closed');
}

module.exports = {
  sequelize,
  Sequelize,
  connect,
  disconnect,
};
