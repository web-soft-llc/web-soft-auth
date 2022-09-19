const fs = require('fs');
const { Server, logger } = require('web-soft-server');
const { AuthModule } = require('../index');
const modules = require('./modules');

let server = {};

const secureStart = async () => {
  try {
    const key = fs.readFileSync('/certs/private.key');
    const cert = fs.readFileSync('/certs/cert.crt');
    server = new Server({ host: '0.0.0.0', port: 443, cors: false, key, cert, secure: true });
    server.start({ ...modules, auth: AuthModule });
  } catch (error) {
    logger.fatal(error);
  }
};

const start = async () => {
  try {
    server = new Server({ host: '0.0.0.0', port: 8000, cors: false });
    server.start({ ...modules, auth: AuthModule });
  } catch (error) {
    logger.fatal(error);
  }
};

process.on('uncaughtException', async (error) => {
  error.message = `Uncaught Exception. ${error.message}`;
  logger.fatal(error);
  await server.close();
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  reason.message = `Unhandled Rejection at Promise. ${reason.message}`;
  logger.fatal(reason);
  await server.close();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.warn('Exited witn SIGTERM signal.');
  await server.close();
  process.exit(1);
});

if (process.env.KEY_PATH && process.env.CERT_PATH) {
  secureStart();
} else {
  start();
}
