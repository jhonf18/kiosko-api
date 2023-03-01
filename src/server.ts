import express, { Application } from 'express';
import { PORT } from './config/env/env';
import { logger } from './config/logger/logger';
import configApp from './config/server';
import connectDatabase from './database/connect';

// TODO: Eliminar los elementos de la lista negra siempre finalizando el día

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
      logger.info(`Server running on port: ${this.PORT}`);
      connectDatabase();
    });
  }
}

export default Server;
