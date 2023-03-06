import express from 'express';
import { ROLES } from '../../shared/config/roles';
import { MiddlewareAuthentication } from './../../shared/middleware';
import routesAdmin from './routes/admin';
import routesProduct from './routes/product';
import routesProductCategory from './routes/productCategory';
import routesUser from './routes/user';

const routesBackOffice = express();

// Only admin services
routesBackOffice.use('/admin', new MiddlewareAuthentication([ROLES.ADMIN]).verifyToken, routesAdmin);

// Routes of managment of user
routesBackOffice.use(
  '/user-managment',
  new MiddlewareAuthentication([ROLES.ADMIN, ROLES.LEADER]).verifyToken,
  routesUser
);

// Routes of managment of products
// TODO: Add verification new MiddlewareAuthentication([ROLES.ADMIN, ROLES.LEADER]).verifyToken
routesBackOffice.use(
  '/products-managment',
  routesProduct
);

// Routes of managment categories
routesBackOffice.use(
  '/categories-managment',
  new MiddlewareAuthentication([ROLES.ADMIN]).verifyToken,
  routesProductCategory
);

export default routesBackOffice;
