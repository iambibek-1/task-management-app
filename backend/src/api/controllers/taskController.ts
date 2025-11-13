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
        try {
            const taskData = req.body;
            
            // Convert empty string to null for dueDate
            if (taskData.dueDate === '' || taskData.dueDate === undefined) {
                taskData.dueDate = null;
            }
            
            // Ensure assignedUserIds is an array
            if (taskData.assignedUserIds && !Array.isArray(taskData.assignedUserIds)) {
                taskData.assignedUserIds = [taskData.assignedUserIds];
            }
            
            const tasks = await new TaskService().createTask(taskData);
            return res.status(201).json({
                success:true,
                status:201,
                message:"Task added successfully",
                data:tasks,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: error.message || "Could not create task",
            });
        }
    }


    public static async updateTask (req:Request, res:Response): Promise<Response>{
        const id = req.params.id as unknown as number;
        const data = req.body;

        try {
            const update = await new TaskService().updateTask(id, data);

            if(update === false){
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: `Task with id ${id} not found`,
                });
            }
            
            return res.status(200).json({
                success:true,
                status:200,
                message:"Task updated successfully",
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: error.message || `Could not update task with id ${id}`,
            });
        }
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

    public static async completeTask (req:Request, res:Response): Promise<Response>{
        const id = parseInt(req.params.id);
        
        try {
            const updated = await new TaskService().completeTask(id);
            
            if(updated === false){
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: `Task with id ${id} not found`,
                });
            }
            
            return res.status(200).json({
                success:true,
                status:200,
                message:"Task marked as completed successfully",
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: error.message || `Could not complete task with id ${id}`,
            });
        }
    }
}