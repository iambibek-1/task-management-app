import { Router } from "express";
import { TaskController } from "../controllers";
import { exceptionHandler } from "../../middlewares";


const taskRoutes = Router();

taskRoutes.get('/',exceptionHandler(TaskController.getTask));
taskRoutes.post('/',exceptionHandler(TaskController.postTask));
taskRoutes.put('/:id',exceptionHandler(TaskController.updateTask));
taskRoutes.delete('/:id',exceptionHandler(TaskController.deleteTask));
taskRoutes.get('/priority/:priority',exceptionHandler(TaskController.getTaskByPriority));

export default taskRoutes;