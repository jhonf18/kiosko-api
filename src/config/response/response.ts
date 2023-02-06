import { Response } from 'express';

export const response = (data: Array<any> | null, message: string, status: number, res: Response) => {
  let response = {
    data: data,
    error: null,
    messages: {
      type: 'OK',
      code: 'OK',
      message: message
    }
  };

  res.status(status);
  res.send(response);
};
