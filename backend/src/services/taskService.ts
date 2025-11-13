import Models from "../models";
import { TaskInterface, InputTaskInterface } from "../interfaces";
import { Model } from "sequelize";
import { PriorEnum } from "../enums";
import { EmailService } from "./emailService";

export class TaskService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  public async createTask(data: InputTaskInterface): Promise<any> {
    const { assignedUserIds, ...taskData } = data;
    
    // Create the task
    const task = await Models.Task.create(taskData);
    
    // Assign users if provided
    if (assignedUserIds && assignedUserIds.length > 0) {
      const assignments = assignedUserIds.map(userId => ({
        taskId: task.id,
        userId: userId,
      }));
      await Models.TaskAssignment.bulkCreate(assignments);
      
      // Fetch assigned users for email notification
      const assignedUsers = await Models.User.findAll({
        where: { id: assignedUserIds },
        attributes: ['id', 'firstName', 'lastName', 'email']
      });
      
      // Send email notifications
      if (assignedUsers.length > 0) {
        await this.emailService.sendBulkTaskAssignmentEmails(
          assignedUsers.map(u => u.toJSON()),
          task.title,
          task.description,
          task.dueDate
        );
      }
    }
    
    // Fetch task with assigned users
    const taskWithUsers = await Models.Task.findByPk(task.id, {
      include: [{
        model: Models.User,
        as: 'assignedUsers',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        through: { attributes: [] }
      }]
    });
    
    return taskWithUsers;
  }

  public async updateTask(
    id: number,
    data: InputTaskInterface
  ): Promise<boolean> {
    // Check if task exists first
    const existingTask = await Models.Task.findByPk(id, {
      include: [{
        model: Models.User,
        as: 'assignedUsers',
        attributes: ['id'],
        through: { attributes: [] }
      }]
    });
    
    if (!existingTask) {
      return false;
    }

    const { assignedUserIds, ...taskData } = data;
    
    // Update task data
    await Models.Task.update(taskData, {
      where: { id: id },
    });
    
    // Update assignments if provided
    if (assignedUserIds !== undefined) {
      // Get old assigned user IDs
      const oldUserIds = (existingTask as any).assignedUsers?.map((u: any) => u.id) || [];
      
      // Find newly assigned users
      const newUserIds = assignedUserIds.filter(userId => !oldUserIds.includes(userId));
      
      // Remove old assignments
      await Models.TaskAssignment.destroy({
        where: { taskId: id }
      });
      
      // Add new assignments
      if (assignedUserIds.length > 0) {
        const assignments = assignedUserIds.map(userId => ({
          taskId: id,
          userId: userId,
        }));
        await Models.TaskAssignment.bulkCreate(assignments);
        
        // Send email to newly assigned users only
        if (newUserIds.length > 0) {
          const newUsers = await Models.User.findAll({
            where: { id: newUserIds },
            attributes: ['id', 'firstName', 'lastName', 'email']
          });
          
          if (newUsers.length > 0) {
            await this.emailService.sendBulkTaskAssignmentEmails(
              newUsers.map(u => u.toJSON()),
              existingTask.title,
              existingTask.description,
              existingTask.dueDate
            );
          }
        }
      }
    }
    
    return true;
  }

  public async deleteTask(id: number): Promise<number> {
    // Assignments will be deleted automatically due to CASCADE
    const deleteT = await Models.Task.destroy({
      where: { id: id },
    });
    return deleteT;
  }

  public async findAll(): Promise<any> {
    const data = await Models.Task.findAll({
      include: [{
        model: Models.User,
        as: 'assignedUsers',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        through: { attributes: [] }
      }]
    });
    return data;
  }

  public async findById(id: number): Promise<any> {
    const task = await Models.Task.findByPk(id, {
      include: [{
        model: Models.User,
        as: 'assignedUsers',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        through: { attributes: [] }
      }]
    });
    return task;
  }

  public async getTaskByPriority(priority:PriorEnum): Promise<any> {
    try {
      const data = await Models.Task.findAll({
        where: { priority: priority },
        include: [{
          model: Models.User,
          as: 'assignedUsers',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: { attributes: [] }
        }]
      });
      return data;
    } catch (error) {
      console.log("Error fetching task", error);
    }
  }

  public async completeTask(id: number): Promise<boolean> {
    // Check if task exists first
    const existingTask = await Models.Task.findByPk(id);
    if (!existingTask) {
      return false;
    }

    // Update task status to completed
    await Models.Task.update(
      { status: 'completed' as any },
      { where: { id: id } }
    );
    
    return true;
  }

  public async findByUserId(userId: number): Promise<any> {
    const tasks = await Models.Task.findAll({
      include: [
        {
          model: Models.User,
          as: 'assignedUsers',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: { attributes: [] },
          where: { id: userId },
          required: true
        }
      ]
    });
    return tasks;
  }

  public async getTaskByPriorityAndUser(priority: PriorEnum, userId: number): Promise<any> {
    try {
      const tasks = await Models.Task.findAll({
        where: { priority: priority },
        include: [
          {
            model: Models.User,
            as: 'assignedUsers',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            through: { attributes: [] },
            where: { id: userId },
            required: true
          }
        ]
      });
      return tasks;
    } catch (error) {
      console.log("Error fetching task", error);
      return [];
    }
  }
}
