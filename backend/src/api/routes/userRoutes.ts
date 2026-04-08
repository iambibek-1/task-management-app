import { Router } from "express";
import { UserController } from "../controllers/userController";
import { exceptionHandler, Guard } from "../../middlewares";


const userRoutes = Router();

userRoutes.get('/',exceptionHandler(UserController.getUSer));
userRoutes.get('/all', Guard.authenticate, Guard.requireAdmin, exceptionHandler(UserController.getAllUsers));

// Debug route to test if the endpoint is reachable
userRoutes.get('/test', (req, res) => {
  res.json({ message: 'User routes are working', timestamp: new Date().toISOString() });
});
userRoutes.post('/',exceptionHandler(UserController.postUser));
userRoutes.patch('/:id',exceptionHandler(UserController.update));
userRoutes.delete('/:id',exceptionHandler(UserController.delete));


export default userRoutes;  
