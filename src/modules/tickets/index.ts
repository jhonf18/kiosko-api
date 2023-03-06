import express from 'express';
import routesOrder from './routes/order';
import routesTicket from './routes/ticket';

const routesEmployees = express();

routesEmployees.use('/orders', routesOrder);
routesEmployees.use('/tickets', routesTicket);

export default routesEmployees;
