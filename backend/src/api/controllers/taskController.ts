import { Request, Response } from "express";
import { TaskService } from "../../services";
import { PriorEnum, RoleEnum, StatusEnum } from "../../enums";
import { CustomRequestInterface } from "../../interfaces";
import { UserRecommendationService } from "../../services/userRecommendationService";

export class TaskController {
    public static async getTask(req:CustomRequestInterface, res:Response): Promise<Response>{
        const userId = req.user?.id;
        const userRole = req.user?.role;
        
        // Admin sees all tasks, users only see their assigned tasks
        const tasks = userRole === RoleEnum.admin 
            ? await new TaskService().findAll()
            : await new TaskService().findByUserId(userId!);
            
        return res.status(200).json({
            success:true,
            status:200,
            message:"Tasks fetched successfully",
            data:tasks,
        });
    }

    public static async getTaskByPriority(req:CustomRequestInterface, res:Response): Promise<Response>{
        const priority = req.params.priority as PriorEnum;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        
        const tasks = userRole === RoleEnum.admin
            ? await new TaskService().getTaskByPriority(priority)
            : await new TaskService().getTaskByPriorityAndUser(priority, userId!);
        
        // Return empty array instead of 404 when no tasks found
        return res.status(200).json({
            success: true,
            status: 200,
            message: tasks && tasks.length > 0 ? "Tasks fetched successfully" : "No tasks found",
            data: tasks || [],
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
            
            // Validate that no admin users are being assigned to tasks
            if (taskData.assignedUserIds && taskData.assignedUserIds.length > 0) {
                const { UserService } = await import('../../services/userService');
                const userService = new UserService();
                
                for (const userId of taskData.assignedUserIds) {
                    const user = await userService.findById(userId);
                    if (user && user.role === 'admin') {
                        return res.status(400).json({
                            success: false,
                            status: 400,
                            message: `Cannot assign tasks to admin users. User ${user.firstName} ${user.lastName} is an admin.`,
                        });
                    }
                }
            }
            
            const task = await new TaskService().createTask(taskData);
            
            // Emit socket event for real-time updates
            if (global.io) {
                // Notify all admins
                global.io.to('admin-room').emit('task-created', task);
                
                // Notify assigned users
                if (taskData.assignedUserIds && taskData.assignedUserIds.length > 0) {
                    taskData.assignedUserIds.forEach((userId: number) => {
                        global.io.to(`user-${userId}`).emit('task-created', task);
                    });
                }
            }
            
            return res.status(201).json({
                success:true,
                status:201,
                message:"Task added successfully",
                data:task,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: error.message || "Could not create task",
            });
        }
    }

    public static async updateTaskStatus(req: CustomRequestInterface, res: Response): Promise<Response> {
        const id = req.params.id as unknown as number;
        const { status } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: "Authentication required",
            });
        }

        try {
            // Check if the task exists and if the user is assigned to it
            const task = await new TaskService().findById(id);
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: `Task with id ${id} not found`,
                });
            }

            // Check if the user is assigned to this task
            const isAssigned = task.assignedUsers?.some((user: any) => user.id === userId);
            
            if (!isAssigned) {
                return res.status(403).json({
                    success: false,
                    status: 403,
                    message: "Access denied. You can only update tasks assigned to you.",
                });
            }

            // Validate status value
            const validStatuses = ['incomplete', 'inProgress', 'completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: "Invalid status. Must be one of: incomplete, inProgress, completed",
                });
            }

            // Convert string to StatusEnum
            let statusEnum: StatusEnum;
            switch (status) {
                case 'incomplete':
                    statusEnum = StatusEnum.incomplete;
                    break;
                case 'inProgress':
                    statusEnum = StatusEnum.inProgress;
                    break;
                case 'completed':
                    statusEnum = StatusEnum.completed;
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        status: 400,
                        message: "Invalid status value",
                    });
            }

            // Update only the status
            const updateResult = await new TaskService().updateTaskStatus(id, statusEnum);

            if (updateResult === false) {
                return res.status(500).json({
                    success: false,
                    status: 500,
                    message: "Failed to update task status",
                });
            }
            
            // Get updated task for socket emission
            const updatedTask = await new TaskService().findById(id);
            
            // Emit socket event for real-time updates
            if (global.io && updatedTask) {
                // Notify all admins
                global.io.to('admin-room').emit('task-updated', updatedTask);
                
                // Notify assigned users
                if (updatedTask.assignedUsers && updatedTask.assignedUsers.length > 0) {
                    updatedTask.assignedUsers.forEach((user: any) => {
                        global.io.to(`user-${user.id}`).emit('task-updated', updatedTask);
                    });
                }
            }
            
            return res.status(200).json({
                success: true,
                status: 200,
                message: "Task status updated successfully",
                data: updatedTask,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: error.message || "Could not update task status",
            });
        }
    }

    public static async updateTask (req:Request, res:Response): Promise<Response>{
        const id = req.params.id as unknown as number;
        const data = req.body;

        try {
            // Validate that no admin users are being assigned to tasks
            if (data.assignedUserIds && data.assignedUserIds.length > 0) {
                const { UserService } = await import('../../services/userService');
                const userService = new UserService();
                
                // Ensure assignedUserIds is an array
                if (!Array.isArray(data.assignedUserIds)) {
                    data.assignedUserIds = [data.assignedUserIds];
                }
                
                for (const userId of data.assignedUserIds) {
                    const user = await userService.findById(userId);
                    if (user && user.role === 'admin') {
                        return res.status(400).json({
                            success: false,
                            status: 400,
                            message: `Cannot assign tasks to admin users. User ${user.firstName} ${user.lastName} is an admin.`,
                        });
                    }
                }
            }
            
            const update = await new TaskService().updateTask(id, data);

            if(update === false){
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: `Task with id ${id} not found`,
                });
            }
            
            // Get updated task for socket emission
            const updatedTask = await new TaskService().findById(id);
            
            // Emit socket event for real-time updates
            if (global.io && updatedTask) {
                // Notify all admins
                global.io.to('admin-room').emit('task-updated', updatedTask);
                
                // Notify assigned users
                if (updatedTask.assignedUsers && updatedTask.assignedUsers.length > 0) {
                    updatedTask.assignedUsers.forEach((user: any) => {
                        global.io.to(`user-${user.id}`).emit('task-updated', updatedTask);
                    });
                }
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
        
        // Get task before deletion for socket emission
        const taskToDelete = await new TaskService().findById(id);
        
        await new TaskService().deleteTask(id);
        
        // Emit socket event for real-time updates
        if (global.io && taskToDelete) {
            // Notify all admins
            global.io.to('admin-room').emit('task-deleted', { id, task: taskToDelete });
            
            // Notify assigned users
            if (taskToDelete.assignedUsers && taskToDelete.assignedUsers.length > 0) {
                taskToDelete.assignedUsers.forEach((user: any) => {
                    global.io.to(`user-${user.id}`).emit('task-deleted', { id, task: taskToDelete });
                });
            }
        }

        return res.status(200).json({
            success:true,
            status:200,
            message:"Task deleted successfully",
        })
    }

    public static async completeTask (req:CustomRequestInterface, res:Response): Promise<Response>{
        const id = parseInt(req.params.id);
        const userId = req.user?.id;
        const { notes } = req.body;
        
        try {
            const updated = await new TaskService().completeTask(id, userId!, notes);
            
            if(updated === false){
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: `Task with id ${id} not found`,
                });
            }
            
            // Get updated task for socket emission
            const completedTask = await new TaskService().findById(id);
            
            // Emit socket event for real-time updates
            if (global.io && completedTask) {
                // Notify all admins
                global.io.to('admin-room').emit('task-completed', completedTask);
                
                // Notify assigned users
                if (completedTask.assignedUsers && completedTask.assignedUsers.length > 0) {
                    completedTask.assignedUsers.forEach((user: any) => {
                        global.io.to(`user-${user.id}`).emit('task-completed', completedTask);
                    });
                }
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

    public static async getTaskAnalytics(req: Request, res: Response): Promise<Response> {
        try {
            const analytics = await new TaskService().getTaskAnalytics();
            
            return res.status(200).json({
                success: true,
                status: 200,
                message: "Task analytics retrieved successfully",
                data: analytics,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: error.message || "Could not retrieve task analytics",
            });
        }
    }

    public static async getTaskRecommendations(req: Request, res: Response): Promise<Response> {
        try {
            const taskData = req.body;
            const recommendations = await new TaskService().getTaskRecommendations(taskData);
            
            return res.status(200).json({
                success: true,
                status: 200,
                message: "Task recommendations generated successfully",
                data: recommendations,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: error.message || "Could not generate task recommendations",
            });
        }
    }

    public static async getUserPerformanceAnalytics(req: CustomRequestInterface, res: Response): Promise<Response> {
        try {
            const userId = req.params.userId ? parseInt(req.params.userId) : req.user?.id;
            const analytics = await new TaskService().getUserPerformanceAnalytics(userId!);
            
            return res.status(200).json({
                success: true,
                status: 200,
                message: "User performance analytics retrieved successfully",
                data: analytics,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: error.message || "Could not retrieve user performance analytics",
            });
        }
    }

    public static async getTaskCompletionRecords(req: CustomRequestInterface, res: Response): Promise<Response> {
        try {
            const { userId, taskId, startDate, endDate } = req.query;
            const filters: any = {};
            
            if (userId) filters.userId = parseInt(userId as string);
            if (taskId) filters.taskId = parseInt(taskId as string);
            if (startDate) filters.startDate = new Date(startDate as string);
            if (endDate) filters.endDate = new Date(endDate as string);
            
            const records = await new TaskService().getTaskCompletionRecords(filters);
            
            return res.status(200).json({
                success: true,
                status: 200,
                message: "Task completion records retrieved successfully",
                data: records,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: error.message || "Could not retrieve task completion records",
            });
        }
    }

    public static async getUserRecommendations(req: Request, res: Response): Promise<Response> {
        try {
            const { title, description, priority, dueDate } = req.body;
            
            if (!title || !description) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: "Title and description are required for user recommendations",
                });
            }

            const userRecommendationService = new UserRecommendationService();
            const recommendations = await userRecommendationService.calculateUserSuitabilityScores({
                title,
                description,
                priority: priority || 'low',
                dueDate
            });
            
            return res.status(200).json({
                success: true,
                status: 200,
                message: "User recommendations generated successfully",
                data: recommendations,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: error.message || "Could not generate user recommendations",
            });
        }
    }

    public static async testEmailService(req: CustomRequestInterface, res: Response): Promise<Response> {
        try {
            const { EmailService } = await import('../../services/emailService');
            const emailService = new EmailService();
            
            const userEmail = req.user?.email || 'test@example.com';
            const userName = `${req.user?.firstName || 'Test'} ${req.user?.lastName || 'User'}`;
            
            const result = await emailService.sendTaskAssignmentEmail(
                userEmail,
                userName,
                'Test Email from TaskFlow',
                'This is a test email to verify that the email service is working correctly. If you receive this email, the email configuration is working properly.',
                new Date(Date.now() + 24 * 60 * 60 * 1000) // Due tomorrow
            );
            
            if (result) {
                return res.status(200).json({
                    success: true,
                    status: 200,
                    message: `Test email sent successfully to ${userEmail}. Check server console for preview URL (if using Ethereal Email).`,
                });
            } else {
                return res.status(500).json({
                    success: false,
                    status: 500,
                    message: "Failed to send test email. Check server logs for details.",
                });
            }
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                status: 500,
                message: error.message || "Could not send test email",
            });
        }
    }
}