import { NextFunction, Request, Response } from 'express';
import { ticketService } from '../dependencyInjectorTickets';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { response } from './../../../config/response/response';

export const getTicketsController = async (req: Request, res: Response, next: NextFunction) => {
  let filter = JSON.parse(JSON.stringify(req.query));
  delete filter.get;

  try {
    const data = await ticketService.getTickets(filter, req.query.get as string);
    if (!data) {
      return response(null, 'No se encontraron tickets.', httpStatus.OK, res);
    }

    return response([...data], 'OK', httpStatus.OK, res);
  } catch (error) {
    next(error);
  }
};

export const changeStateTicketController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data = await ticketService.changeStatusTicket(req.params.idTicket, req.body.state);

    response([data], 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
};
