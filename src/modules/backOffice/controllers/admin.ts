import express, { NextFunction, Request, Response } from 'express';
import { response } from '../../../config/response/response';
import { httpStatus } from './../../../config/errors/httpStatusCodes';
import { branchOfficeService } from './../dependencyInjector';
const routesAdmin = express();

// Methods GET
routesAdmin.get('/branch-offices', (_req, res) => {
  res.send('Obtener sucursales');
});

// Methods POST
routesAdmin.post('/create-branch-office', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data = await branchOfficeService.createBranchOffice({
      name: req.body.name,
      address: req.body.address,
      employees: req.body.employees
    });

    response([data], 'OK', httpStatus.CREATED, res);
  } catch (error) {
    next(error);
  }
});

routesAdmin.post('/create-job', (_req, res) => {
  res.send('Crear empleo');
});

// Methods PUT

routesAdmin.put('/edit-branch-office/:id_branch_office', (req, res) => {
  console.log(req.params.id_branch_office);
  res.send('Editar sucursal ' + req.params.id_branch_office);
});

// Methods DELETE
routesAdmin.put('/delete-user/:id_user', (_req, res) => {
  res.send('Eliminar sucursal');
});

routesAdmin.post('/delete-job', (_req, res) => {
  res.send('Eliminar empleo');
});

export default routesAdmin;
