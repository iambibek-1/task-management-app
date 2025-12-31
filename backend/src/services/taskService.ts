import Models from "../models";
import { TaskInterface, InputTaskInterface } from "../interfaces";
import { Model, Op } from "sequelize";
import { PriorEnum } from "../enums";
import { EmailService } from "./emailService";
import { TaskRecommendationService } from "./taskRecommendationService";

export class TaskService {
  private emailService: EmailService;
  private recommendationService: TaskRecommendationService;

  constructor() {
    this.emailService = new EmailService();
    this.recommendationService = new TaskRecommendationService();
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

  public async completeTask(id: number, userId: number, notes?: string): Promise<boolean> {
    // Check if task exists first
    const existingTask = await Models.Task.findByPk(id);
    if (!existingTask) {
      return false;
    }

    const completedAt = new Date();
    const createdAt = existingTask.createdAt ? new Date(existingTask.createdAt) : new Date();
    
    // Calculate time spent in hours based on creation and completion dates
    const timeSpentMilliseconds = completedAt.getTime() - createdAt.getTime();
    const timeSpentHours = Math.round((timeSpentMilliseconds / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
    
    // Update task status and actual hours
    await Models.Task.update(
      { 
        status: 'completed' as any,
        actualHours: timeSpentHours,
        completedAt: completedAt
      },
      { where: { id: id } }
    );
    
    // Create completion record with auto-calculated time
    // Since we don't have estimated hours, we'll calculate efficiency based on task complexity and time spent
    // This is a simplified approach - in a real system, you might want to use historical averages
    let efficiency = 1.0;
    
    // Calculate efficiency based on task complexity and time spent
    const taskComplexity = this.estimateTaskComplexity(existingTask.title, existingTask.description, existingTask.priority);
    const expectedHours = taskComplexity; // Use complexity as expected hours
    
    if (timeSpentHours > 0) {
      efficiency = expectedHours / timeSpentHours;
      // Cap efficiency between 0.1 and 3.0 for realistic values
      efficiency = Math.max(0.1, Math.min(3.0, efficiency));
    }
    
    await Models.TaskCompletion.create({
      taskId: id,
      userId: userId,
      completedAt: completedAt,
      timeSpentHours: timeSpentHours,
      efficiency: efficiency,
      notes: notes || undefined
    });
    
    return true;
  }

  /**
   * Estimate task complexity based on title, description, and priority
   * Returns estimated hours for efficiency calculation
   */
  private estimateTaskComplexity(title: string, description: string, priority: string): number {
    let baseHours = 2; // Base complexity
    
    // Adjust based on content length and keywords
    const content = `${title} ${description}`.toLowerCase();
    const contentLength = content.length;
    
    // Content length factor
    if (contentLength > 500) baseHours += 3;
    else if (contentLength > 200) baseHours += 2;
    else if (contentLength > 100) baseHours += 1;
    
    // Complexity keywords
    const complexityKeywords = [
      'integration', 'database', 'api', 'algorithm', 'complex', 'multiple',
      'system', 'architecture', 'design', 'implement', 'develop', 'create',
      'build', 'configure', 'setup', 'install', 'deploy', 'test', 'debug'
    ];
    
    const keywordMatches = complexityKeywords.filter(keyword => content.includes(keyword)).length;
    baseHours += keywordMatches * 0.5;
    
    // Priority adjustment
    switch (priority) {
      case 'high':
        baseHours *= 1.2; // High priority tasks often more complex
        break;
      case 'medium':
        baseHours *= 1.0;
        break;
      case 'low':
        baseHours *= 0.8;
        break;
    }
    
    // Cap between 1 and 20 hours
    return Math.max(1, Math.min(20, Math.round(baseHours * 10) / 10));
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

  /**
   * Get task recommendations for creation
   */
  public async getTaskRecommendations(taskData: {
    title: string;
    description: string;
    priority?: string;
    estimatedHours?: number;
    assignedUserIds?: number[];
  }) {
    return await this.recommendationService.getTaskCreationRecommendations(taskData);
  }

  /**
   * Get user performance analytics
   */
  public async getUserPerformanceAnalytics(userId: number) {
    return await this.recommendationService.getUserPerformanceAnalytics(userId);
  }

  /**
   * Get task completion records
   */
  public async getTaskCompletionRecords(filters?: {
    userId?: number;
    taskId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const whereClause: any = {};
    
    if (filters?.userId) whereClause.userId = filters.userId;
    if (filters?.taskId) whereClause.taskId = filters.taskId;
    if (filters?.startDate || filters?.endDate) {
      whereClause.completedAt = {};
      if (filters.startDate) whereClause.completedAt[Op.gte] = filters.startDate;
      if (filters.endDate) whereClause.completedAt[Op.lte] = filters.endDate;
    }

    return await Models.TaskCompletion.findAll({
      where: whereClause,
      include: [
        {
          model: Models.Task,
          as: 'task',
          attributes: ['id', 'title', 'priority']
        },
        {
          model: Models.User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['completedAt', 'DESC']]
    });
  }

  /**
   * Get task analytics dashboard data
   */
  public async getTaskAnalytics() {
    const totalTasks = await Models.Task.count();
    const completedTasks = await Models.Task.count({ where: { status: 'completed' } });
    const inProgressTasks = await Models.Task.count({ where: { status: 'inProgress' } });
    const incompleteTasks = await Models.Task.count({ where: { status: 'incompleted' } });
    
    // Average completion time
    const completions = await Models.TaskCompletion.findAll({
      attributes: ['timeSpentHours', 'efficiency'],
      limit: 100,
      order: [['completedAt', 'DESC']]
    });
    
    const avgTimeSpent = completions.length > 0 
      ? completions.reduce((sum, comp) => sum + comp.timeSpentHours, 0) / completions.length
      : 0;
    
    const avgEfficiency = completions.length > 0
      ? completions.reduce((sum, comp) => sum + comp.efficiency, 0) / completions.length
      : 1.0;
    
    // Overdue tasks
    const now = new Date();
    const overdueTasks = await Models.Task.count({
      where: {
        dueDate: { [Op.lt]: now },
        status: { [Op.ne]: 'completed' }
      }
    });
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      incompleteTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      avgTimeSpentHours: avgTimeSpent,
      avgEfficiency: avgEfficiency
    };
  }
}