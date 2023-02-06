import express from 'express';
import { MiddlewareAuthentication } from './../../shared/middleware';
import routesAdmin from './routes/admin';

const routesBackOffice = express();

routesBackOffice.use('/admin', new MiddlewareAuthentication(['ROLE_ADMIN']).verifyToken, routesAdmin);

export default routesBackOffice;
