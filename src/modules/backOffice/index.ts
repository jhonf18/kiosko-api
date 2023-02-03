import express from 'express';
import { MiddlewareAuthentication } from './../../shared/middleware';
import routesAdmin from './controllers/admin';

const routesBackOffice = express();

routesBackOffice.use('/admin', new MiddlewareAuthentication(['ROLE_ADMIN']).verifyToken, routesAdmin);

export default routesBackOffice;
