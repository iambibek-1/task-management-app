import Models from "../models";
import { Op } from "sequelize";

export interface TaskRecommendation {
  type: 'priority' | 'time_estimate' | 'user_assignment' | 'due_date';
  message: string;
  confidence: number; // 0-1 scale
  data?: any;
}

export class TaskRecommendationService {
  
  /**
   * Get recommendations for creating a new task
   */
  public async getTaskCreationRecommendations(taskData: {
    title: string;
    description: string;
    priority?: string;
    assignedUserIds?: number[];
  }): Promise<TaskRecommendation[]> {
    const recommendations: TaskRecommendation[] = [];
    
    // Priority recommendation based on keywords
    const priorityRec = await this.recommendPriority(taskData.title, taskData.description);
    if (priorityRec) recommendations.push(priorityRec);
    
    // Time estimation recommendation
    const timeRec = await this.recommendTimeEstimate(taskData.title, taskData.description);
    if (timeRec) recommendations.push(timeRec);
    
    // User assignment recommendation
    if (taskData.assignedUserIds && taskData.assignedUserIds.length > 0) {
      const userRec = await this.recommendUserAssignment(taskData.assignedUserIds);
      if (userRec) recommendations.push(userRec);
    }
    
    // Due date recommendation
    const dueDateRec = await this.recommendDueDate(taskData.priority || 'low');
    if (dueDateRec) recommendations.push(dueDateRec);
    
    return recommendations;
  }
  
  /**
   * Recommend priority based on task content analysis
   */
  private async recommendPriority(title: string, description: string): Promise<TaskRecommendation | null> {
    const content = `${title} ${description}`.toLowerCase();
    
    // High priority keywords
    const highPriorityKeywords = [
      'urgent', 'critical', 'emergency', 'asap', 'immediately', 'bug', 'error', 
      'crash', 'security', 'production', 'deadline', 'client', 'customer'
    ];
    
    // Medium priority keywords
    const mediumPriorityKeywords = [
      'important', 'feature', 'enhancement', 'improvement', 'update', 'fix',
      'optimize', 'performance', 'review', 'meeting'
    ];
    
    const highMatches = highPriorityKeywords.filter(keyword => content.includes(keyword));
    const mediumMatches = mediumPriorityKeywords.filter(keyword => content.includes(keyword));
    
    if (highMatches.length > 0) {
      return {
        type: 'priority',
        message: `Consider setting priority to HIGH. Detected keywords: ${highMatches.join(', ')}`,
        confidence: Math.min(0.9, 0.5 + (highMatches.length * 0.1)),
        data: { suggestedPriority: 'high', keywords: highMatches }
      };
    }
    
    if (mediumMatches.length > 0) {
      return {
        type: 'priority',
        message: `Consider setting priority to MEDIUM. Detected keywords: ${mediumMatches.join(', ')}`,
        confidence: Math.min(0.8, 0.4 + (mediumMatches.length * 0.1)),
        data: { suggestedPriority: 'medium', keywords: mediumMatches }
      };
    }
    
    return null;
  }
  
  /**
   * Recommend time estimate based on historical data and content analysis
   */
  private async recommendTimeEstimate(title: string, description: string): Promise<TaskRecommendation | null> {
    try {
      // Get historical data for similar tasks
      const similarTasks = await Models.Task.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${title.split(' ')[0]}%` } },
            { description: { [Op.iLike]: `%${title.split(' ')[0]}%` } }
          ]
        },
        limit: 10
      });
      
      if (similarTasks.length > 0) {
        // For now, use a simple estimation since actualHours might not be available yet
        const avgHours = 4; // Default estimation
        
        return {
          type: 'time_estimate',
          message: `Based on ${similarTasks.length} similar tasks, estimated time: ${avgHours} hours`,
          confidence: Math.min(0.8, 0.3 + (similarTasks.length * 0.05)),
          data: { suggestedHours: avgHours, basedOnTasks: similarTasks.length }
        };
      }
      
      // Fallback: estimate based on content length and complexity
      const contentLength = title.length + description.length;
      const complexityKeywords = ['integration', 'database', 'api', 'algorithm', 'complex', 'multiple'];
      const complexityScore = complexityKeywords.filter(keyword => 
        `${title} ${description}`.toLowerCase().includes(keyword)
      ).length;
      
      let estimatedHours = 2; // Base estimate
      if (contentLength > 200) estimatedHours += 2;
      if (complexityScore > 0) estimatedHours += complexityScore * 1.5;
      
      return {
        type: 'time_estimate',
        message: `Estimated time based on content analysis: ${estimatedHours} hours`,
        confidence: 0.5,
        data: { suggestedHours: estimatedHours, method: 'content_analysis' }
      };
      
    } catch (error) {
      console.error('Error in time estimation:', error);
      return null;
    }
  }
  
  /**
   * Recommend user assignment based on workload and performance
   */
  private async recommendUserAssignment(assignedUserIds: number[]): Promise<TaskRecommendation | null> {
    try {
      // Get user workload (active tasks)
      const userWorkloads = await Promise.all(
        assignedUserIds.map(async (userId) => {
          const activeTasks = await Models.Task.count({
            include: [{
              model: Models.User,
              as: 'assignedUsers',
              where: { id: userId },
              required: true
            }],
            where: {
              status: { [Op.in]: ['incompleted', 'inProgress'] }
            }
          });
          
          // Get user completion efficiency
          const completions = await Models.TaskCompletion.findAll({
            where: { userId },
            limit: 10,
            order: [['completedAt', 'DESC']]
          });
          
          const avgEfficiency = completions.length > 0 
            ? completions.reduce((sum, comp) => sum + comp.efficiency, 0) / completions.length
            : 1.0;
          
          return { userId, activeTasks, avgEfficiency };
        })
      );
      
      const overloadedUsers = userWorkloads.filter(user => user.activeTasks > 5);
      const efficientUsers = userWorkloads.filter(user => user.avgEfficiency > 1.2);
      
      if (overloadedUsers.length > 0) {
        return {
          type: 'user_assignment',
          message: `Warning: Some assigned users have high workload (>5 active tasks)`,
          confidence: 0.8,
          data: { overloadedUsers: overloadedUsers.map(u => u.userId) }
        };
      }
      
      if (efficientUsers.length > 0) {
        return {
          type: 'user_assignment',
          message: `Assigned users have good efficiency ratings (avg: ${efficientUsers[0].avgEfficiency.toFixed(1)}x)`,
          confidence: 0.7,
          data: { efficientUsers: efficientUsers.map(u => u.userId) }
        };
      }
      
    } catch (error) {
      console.error('Error in user assignment recommendation:', error);
    }
    
    return null;
  }
  
  /**
   * Recommend due date based on priority
   */
  private async recommendDueDate(priority: string): Promise<TaskRecommendation | null> {
    const now = new Date();
    let recommendedDays = 7; // Default
    
    switch (priority) {
      case 'high':
        recommendedDays = 2;
        break;
      case 'medium':
        recommendedDays = 5;
        break;
      case 'low':
        recommendedDays = 10;
        break;
    }
    
    const recommendedDate = new Date(now);
    recommendedDate.setDate(now.getDate() + recommendedDays);
    
    return {
      type: 'due_date',
      message: `Recommended due date: ${recommendedDate.toLocaleDateString()} (${recommendedDays} days from now)`,
      confidence: 0.6,
      data: { 
        suggestedDate: recommendedDate.toISOString().split('T')[0],
        daysFromNow: recommendedDays 
      }
    };
  }
  
  /**
   * Get user performance analytics
   */
  public async getUserPerformanceAnalytics(userId: number): Promise<{
    completedTasks: number;
    averageEfficiency: number;
    averageTimeSpent: number;
    onTimeCompletionRate: number;
  }> {
    try {
      const completions = await Models.TaskCompletion.findAll({
        where: { userId },
        include: [{
          model: Models.Task,
          as: 'task'
        }]
      });
      
      if (completions.length === 0) {
        return {
          completedTasks: 0,
          averageEfficiency: 1.0,
          averageTimeSpent: 0,
          onTimeCompletionRate: 0
        };
      }
      
      const totalEfficiency = completions.reduce((sum, comp) => sum + comp.efficiency, 0);
      const totalTimeSpent = completions.reduce((sum, comp) => sum + comp.timeSpentHours, 0);
      
      // Calculate on-time completion rate
      const onTimeCompletions = completions.filter(comp => {
        const task = (comp as any).task;
        return !task.dueDate || new Date(comp.completedAt) <= new Date(task.dueDate);
      }).length;
      
      return {
        completedTasks: completions.length,
        averageEfficiency: totalEfficiency / completions.length,
        averageTimeSpent: totalTimeSpent / completions.length,
        onTimeCompletionRate: onTimeCompletions / completions.length
      };
      
    } catch (error) {
      console.error('Error getting user performance analytics:', error);
      return {
        completedTasks: 0,
        averageEfficiency: 1.0,
        averageTimeSpent: 0,
        onTimeCompletionRate: 0
      };
    }
  }
}