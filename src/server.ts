import express, { Application } from 'express';
import { PORT } from './config/env/env';
import { logger } from './config/logger/logger';
import configApp from './config/server';

class Server {
  private app: Application;
  private PORT: number;

  constructor() {
    this.app = express();
    this.PORT = PORT;
  }

  config() {
    this.app.use(configApp);
  }

  listen() {
    this.config();
    this.app.listen(this.PORT, () => {
      logger.info('Server running on port: ' + this.PORT);
    });
  }
}

export default Server;
