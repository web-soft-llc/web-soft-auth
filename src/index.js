const { Server, logger } = require('web-soft-server');
const { AuthModule } = require('../index');
const modules = require('./modules');

let server = {};

const start = async () => {
  try {
    server = new Server({ host: '0.0.0.0', port: 8000, cors: false });
    server.start({ ...modules, auth: AuthModule });
  } catch (error) {
    logger.fatal(error);
  }
};

start();
