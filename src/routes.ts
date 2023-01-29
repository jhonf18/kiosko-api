import express from 'express';
import routesAuth from './modules/auth/controller';

const routes = express();

// load all routes here
routes.use('/auth', routesAuth);

export default routes;
