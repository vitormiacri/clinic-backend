import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import RateLimit from 'express-rate-limit';

import routes from './routes';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(helmet());
    this.server.use(cors());
    this.server.use(express.json());

    if (process.env.NODE_ENV !== 'development') {
      this.server.use(
        new RateLimit({
          windowMs: 1000 * 60 * 15,
          max: 100,
        })
      );
    }
  }

  routes() {
    this.server.use(routes);
  }
}
export default new App().server;
