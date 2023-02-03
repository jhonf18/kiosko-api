import express from 'express';
import routesAuth from './modules/auth/controller';
import routesBackOffice from './modules/backOffice';

const routes = express();

// Load routes by module
routes.use('/auth', routesAuth);
routes.use('/back-office', routesBackOffice);

export default routes;
