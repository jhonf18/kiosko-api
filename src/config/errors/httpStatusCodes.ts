interface HttpStatus {
  OK: number;
  CREATED: number;
  BAD_REQUEST: number;
  FORBIDDEN: number;
  NOT_FOUND: number;
  INTERNAL_SERVER_ERROR: number;
}

export const httpStatus: HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};
