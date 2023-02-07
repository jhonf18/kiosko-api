import express from 'express';
import {
  createBranchOfficeController,
  deleteBranchOfficeController,
  getBranchOfficeController,
  getBranchOfficesController,
  updateBranchOfficeController
} from './../controllers/branchOffice';
import { deleteUserController, updateUserController } from './../controllers/userManagment';

const routesAdmin = express();

// Methods GET

routesAdmin.get('/branch-offices', getBranchOfficesController);
routesAdmin.get('/branch-office/:idBranchOffice', getBranchOfficeController);
routesAdmin.get('/roles', (_req, res) => {
  res.send('Actualizar usuario');
});

// Methods POST

routesAdmin.post('/create-branch-office', createBranchOfficeController);

// Methods PUT

routesAdmin.put('/update-branch-office/:idBranchOffice', updateBranchOfficeController);
routesAdmin.put('/update-user/:idUser', updateUserController);

// Methods DELETE
routesAdmin.delete('/delete-branch-office/:idBranchOffice', deleteBranchOfficeController);
routesAdmin.delete('/delete-user/:idUser', deleteUserController);

export default routesAdmin;
