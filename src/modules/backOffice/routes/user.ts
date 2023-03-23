import express from 'express';
import { deleteUserController, getUsersController, updateUserController } from '../controllers/userManagment';

const routesUser = express();

routesUser.get('/users', getUsersController);

// Methods PUT
routesUser.put('/update-user/:idUser', updateUserController);

// Methods DELETE
routesUser.delete('/delete-user/:idUser', deleteUserController);

export default routesUser;
