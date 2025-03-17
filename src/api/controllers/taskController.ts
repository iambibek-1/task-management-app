import { Request, Response } from "express";
import { TaskService } from "../../services";
import { PriorEnum } from "../../enums";


export class TaskController {
    public static async getTask(req:Request, res:Response): Promise<Response>{
        const tasks = await new TaskService().findAll();
        return res.status(200).json({
            success:true,
            status:200,
            message:"Tasks fetched successfully",
            data:tasks,
        });
    }

    public static async getTaskByPriority(req:Request, res:Response): Promise<Response>{
        const priority = req.params.priority as PriorEnum;
         const tasks = await new TaskService().getTaskByPriority(priority);
    // console.log(priority);
    if (!tasks) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: `Tasks with :${priority} priority are not found`,
        });
      }
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Task fetched successfully",
        data: tasks,
      });
    }

    public static async postTask (req:Request, res: Response): Promise<Response>{
        const tasks = await new TaskService().createTask(req.body);
        return res.status(201).json({
            success:true,
            status:201,
            message:"Task added successfully",
            data:tasks,
        });
    }


    public static async updateTask (req:Request, res:Response): Promise<Response>{
        const id = req.params.id as unknown as number;
        const data = req.body;


        const update = await new TaskService().updateTask(id, data);

        if(update === false){
            throw new Error(`Couldnot update task with id ${id}`);
        }
        return res.status(200).json({
            success:true,
            status:200,
            message:"Task updated successfully",
        });
    }

    public static async deleteTask (req:Request, res:Response): Promise<Response>{
        const id = parseInt(req.params.id);
        await new TaskService().deleteTask(id);

        return res.status(200).json({
            success:true,
            status:200,
            message:"Task deleted successfully",
        })
    }
}