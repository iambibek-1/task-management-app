import { Router } from "express";
import { UserController } from "../controllers/userController";
import { exceptionHandler } from "../../middlewares";


const userRoutes = Router();

userRoutes.get('/',exceptionHandler(UserController.getUSer));
userRoutes.post('/',exceptionHandler(UserController.postUser));
userRoutes.patch('/:id',exceptionHandler(UserController.update));
userRoutes.delete('/:id',exceptionHandler(UserController.delete));


export default userRoutes;  
