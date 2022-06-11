import app from './app';
import config from './utils/config';
import { connectToDatabase } from './utils/db';
import logger from './utils/logger';

const http = require('http');

const server = http.createServer(app);

// server.listen(config.PORT, () => {
//   logger.info(`Server running on port ${config.PORT}`);
// });

const start = async () => {
  await connectToDatabase();
  server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
  });
};

start();
