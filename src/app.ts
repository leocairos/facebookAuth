import express, { Router } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import logger from 'morgan';

function getCorsOrigin() {
  const origin = process.env.CORS_ORIGIN;
  if (!origin) throw new Error('CORS_ORIGIN is a required env var.');

  if (origin === '*') return origin;

  return new RegExp(origin);
}

export default (router: Router) => {
  const app = express();
  const corsOptions = {
    origin: getCorsOrigin(),
    optionsSuccessStatus: 200
  };

  app.use(logger('dev'));
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json());

  /*app.get(`/${process.env.MS_PATH}/health/`, (req, res, next) => {
    res.json({ message: `${process.env.MS_NAME} is up and running!` });
  })*/

  app.set('view engine', 'ejs');
  app.set('views', 'src');
  app.use(router);

  return app;
}
