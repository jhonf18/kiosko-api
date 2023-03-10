import * as jwt from 'jsonwebtoken';
import { v4 as uuid4 } from 'uuid';
import { JWT_ALGO, JWT_EXPIRES, JWT_SECRET } from '../../config/env/env';

export const generateToken = ({ id, idBranchOffice }: { id: string; idBranchOffice?: string }): string => {
  const data = {
    jti: uuid4(),
    id,
    id_branch_office: idBranchOffice
  };

  const token = jwt.sign(data, JWT_SECRET, {
    algorithm: JWT_ALGO,
    expiresIn: JWT_EXPIRES,
    audience: 'kiosko'
  });

  return token;
};
