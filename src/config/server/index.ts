import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { FRONTEND_URL, REALTIME_URL } from '../../config/env/env';
import routes from '../../routes';
import { errorHandlerApp } from '../errors/errorHandlerApp';
import { httpLogger } from './../logger/httpLogger';
const configApp = express();

// config cors
//if (process.env.ENV === 'development') {

configApp.use(
  cors({
    origin: [FRONTEND_URL, REALTIME_URL],
    optionsSuccessStatus: 200
  })
);
//} else {
//  configApp.use(
//    cors({
//      origin: ['https://fourp.space'],
//      optionsSuccessStatus: 200
//    })
//  );
//}

// configuration logger with morgan
configApp.use(httpLogger);

// config standard
configApp.use(compression());
//configApp.use(bodyParser.json());
//configApp.use(bodyParser.urlencoded({ extended: false }));
configApp.use(express.json());

// load routes from /api
configApp.use('/api', routes);

// error handler middlewar
configApp.use(errorHandlerApp);

export default configApp;
