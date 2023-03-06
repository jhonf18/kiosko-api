import express from 'express';
import routesAuth from './modules/auth/controller';
import routesBackOffice from './modules/backOffice';
import routesEmployees from './modules/tickets';

const routes = express();

// Load routes by module
routes.use('/auth', routesAuth);
routes.use('/back-office', routesBackOffice);
routes.use('/managment-orders', routesEmployees);

export default routes;
