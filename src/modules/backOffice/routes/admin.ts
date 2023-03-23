import express from 'express';
import {
  createBranchOfficeController,
  deleteBranchOfficeController,
  getBranchOfficeController,
  getBranchOfficesController,
  updateBranchOfficeController
} from './../controllers/branchOffice';
import {
  deleteUserController,
  getRolesController,
  updateUserController,
  verifyPasswordController
} from './../controllers/userManagment';

const routesAdmin = express();

// Methods GET

routesAdmin.get('/branch-offices', getBranchOfficesController);
routesAdmin.get('/branch-office/:idBranchOffice', getBranchOfficeController);
routesAdmin.get('/roles', getRolesController);

// Methods POST

routesAdmin.post('/create-branch-office', createBranchOfficeController);
routesAdmin.post('/verify-password', verifyPasswordController);

// Methods PUT

routesAdmin.put('/update-branch-office/:idBranchOffice', updateBranchOfficeController);
routesAdmin.put('/update-user/:idUser', updateUserController);

// Methods DELETE

routesAdmin.delete('/delete-branch-office/:idBranchOffice', deleteBranchOfficeController);
routesAdmin.delete('/delete-user/:idUser', deleteUserController);

export default routesAdmin;
