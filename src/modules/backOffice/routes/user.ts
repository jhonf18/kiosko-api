import express from 'express';
import { deleteUserController, updateUserController } from '../controllers/userManagment';

const routesUser = express();

// Methods PUT
routesUser.put('/update-user/:idUser', updateUserController);

// Methods DELETE
routesUser.delete('/delete-user/:idUser', deleteUserController);

export default routesUser;
