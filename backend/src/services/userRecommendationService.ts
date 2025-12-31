import Models from "../models";
import { Op } from "sequelize";

export interface UserSuitabilityScore {
  userId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  score: number;
  factors: {
    performanceScore: number;
    workloadScore: number;
    availabilityScore: number;
    skillMatchScore: number;
    priorityHandlingScore: number;
  };
  recommendation: 'highly-recommended' | 'recommended' | 'suitable' | 'not-recommended';
  reasonText: string;
}

export class UserRecommendationService {
  
  /**
   * Weighted User Suitability Scoring (WUSS) Algorithm
   * Calculates user suitability based on multiple weighted factors
   */
  public async calculateUserSuitabilityScores(taskData: {
    title: string;
    description: string;
    priority: string;
    dueDate?: string;
  }): Promise<UserSuitabilityScore[]> {
    
    // Get all users (excluding admins for task assignment)
    const users = await Models.User.findAll({
      where: { role: 'user' },
      attributes: ['id', 'firstName', 'lastName', 'email']
    });

    const userScores: UserSuitabilityScore[] = [];

    for (const user of users) {
      const factors = await this.calculateUserFactors(user.id, taskData);
      const weightedScore = this.calculateWeightedScore(factors);
      const recommendation = this.getRecommendationLevel(weightedScore);
      const reasonText = this.generateReasonText(factors, recommendation);

      userScores.push({
        userId: user.id,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        score: weightedScore,
        factors,
        recommendation,
        reasonText
      });
    }

    // Sort by score (highest first)
    return userScores.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate individual factors for WUSS algorithm
   */
  private async calculateUserFactors(userId: number, taskData: {
    title: string;
    description: string;
    priority: string;
    dueDate?: string;
  }) {
    // Factor 1: Performance Score (0-100)
    const performanceScore = await this.calculatePerformanceScore(userId);
    
    // Factor 2: Workload Score (0-100) - Higher score means less workload
    const workloadScore = await this.calculateWorkloadScore(userId);
    
    // Factor 3: Availability Score (0-100)
    const availabilityScore = await this.calculateAvailabilityScore(userId, taskData.dueDate);
    
    // Factor 4: Skill Match Score (0-100)
    const skillMatchScore = await this.calculateSkillMatchScore(userId, taskData.title, taskData.description);
    
    // Factor 5: Priority Handling Score (0-100)
    const priorityHandlingScore = await this.calculatePriorityHandlingScore(userId, taskData.priority);

    return {
      performanceScore,
      workloadScore,
      availabilityScore,
      skillMatchScore,
      priorityHandlingScore
    };
  }

  /**
   * Calculate weighted score using WUSS algorithm
   * Weights can be adjusted based on business requirements
   */
  private calculateWeightedScore(factors: {
    performanceScore: number;
    workloadScore: number;
    availabilityScore: number;
    skillMatchScore: number;
    priorityHandlingScore: number;
  }): number {
    const weights = {
      performance: 0.30,    // 30% - Most important
      workload: 0.25,       // 25% - Very important
      availability: 0.20,   // 20% - Important
      skillMatch: 0.15,     // 15% - Moderately important
      priorityHandling: 0.10 // 10% - Least important but still relevant
    };

    return Math.round(
      (factors.performanceScore * weights.performance) +
      (factors.workloadScore * weights.workload) +
      (factors.availabilityScore * weights.availability) +
      (factors.skillMatchScore * weights.skillMatch) +
      (factors.priorityHandlingScore * weights.priorityHandling)
    );
  }

  /**
   * Calculate user performance score based on historical data
   */
  private async calculatePerformanceScore(userId: number): Promise<number> {
    try {
      const completions = await Models.TaskCompletion.findAll({
        where: { userId },
        limit: 20, // Last 20 completions
        order: [['completedAt', 'DESC']]
      });

      if (completions.length === 0) {
        return 60; // Lower default score for new users to encourage trying them
      }

      // Calculate average efficiency
      const avgEfficiency = completions.reduce((sum, comp) => sum + comp.efficiency, 0) / completions.length;
      
      // Calculate completion rate (how many tasks they actually complete vs abandon)
      const totalAssignedTasks = await Models.Task.count({
        include: [{
          model: Models.User,
          as: 'assignedUsers',
          where: { id: userId },
          required: true
        }]
      });
      
      const completionRate = totalAssignedTasks > 0 ? completions.length / totalAssignedTasks : 1.0;
      
      // Calculate recent performance trend (last 5 vs previous 5)
      let trendMultiplier = 1.0;
      if (completions.length >= 10) {
        const recent5 = completions.slice(0, 5);
        const previous5 = completions.slice(5, 10);
        const recentAvg = recent5.reduce((sum, comp) => sum + comp.efficiency, 0) / 5;
        const previousAvg = previous5.reduce((sum, comp) => sum + comp.efficiency, 0) / 5;
        
        if (recentAvg > previousAvg) {
          trendMultiplier = 1.1; // Improving performance
        } else if (recentAvg < previousAvg * 0.9) {
          trendMultiplier = 0.9; // Declining performance
        }
      }

      // Combine efficiency, completion rate, and trend
      let performanceScore = (avgEfficiency * 40) + (completionRate * 40) + 20; // Base 20 points
      performanceScore *= trendMultiplier;
      
      // Cap between 10 and 100
      performanceScore = Math.min(100, Math.max(10, performanceScore));

      return Math.round(performanceScore);
    } catch (error) {
      console.error('Error calculating performance score:', error);
      return 60; // Default score
    }
  }

  /**
   * Calculate workload score (higher score = less workload = better)
   */
  private async calculateWorkloadScore(userId: number): Promise<number> {
    try {
      // Count active tasks using TaskAssignments table (not the old assignedTo field)
      const activeTasks = await Models.Task.count({
        include: [{
          model: Models.User,
          as: 'assignedUsers',
          where: { id: userId },
          required: true,
          through: { attributes: [] }
        }],
        where: {
          status: { [Op.in]: ['incompleted', 'inProgress'] }
        }
      });

      // Also consider overdue tasks as they add to workload stress
      const overdueTasks = await Models.Task.count({
        include: [{
          model: Models.User,
          as: 'assignedUsers',
          where: { id: userId },
          required: true,
          through: { attributes: [] }
        }],
        where: {
          status: { [Op.in]: ['incompleted', 'inProgress'] },
          dueDate: { [Op.lt]: new Date() }
        }
      });

      // Score decreases as workload increases
      // 0 tasks = 100 points, 1-2 tasks = 85 points, 3-4 tasks = 70 points, etc.
      let workloadScore = 100;
      if (activeTasks > 0) {
        workloadScore = Math.max(10, 100 - (activeTasks * 12));
      }
      
      // Penalty for overdue tasks (they indicate poor time management or overload)
      if (overdueTasks > 0) {
        workloadScore -= (overdueTasks * 15);
      }

      return Math.max(10, Math.min(100, workloadScore));
    } catch (error) {
      console.error('Error calculating workload score:', error);
      return 50; // Default score
    }
  }

  /**
   * Calculate availability score based on due date and current commitments
   */
  private async calculateAvailabilityScore(userId: number, dueDate?: string): Promise<number> {
    try {
      if (!dueDate) {
        return 80; // Default score when no due date
      }

      const taskDueDate = new Date(dueDate);
      const now = new Date();
      const daysUntilDue = Math.ceil((taskDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check for conflicting tasks around the due date using TaskAssignments
      const conflictingTasks = await Models.Task.count({
        include: [{
          model: Models.User,
          as: 'assignedUsers',
          where: { id: userId },
          required: true,
          through: { attributes: [] }
        }],
        where: {
          dueDate: {
            [Op.between]: [
              new Date(taskDueDate.getTime() - (3 * 24 * 60 * 60 * 1000)), // 3 days before
              new Date(taskDueDate.getTime() + (3 * 24 * 60 * 60 * 1000))  // 3 days after
            ]
          },
          status: { [Op.ne]: 'completed' }
        }
      });

      let availabilityScore = 100;
      
      // Reduce score based on conflicting tasks
      availabilityScore -= (conflictingTasks * 20);
      
      // Adjust based on time pressure
      if (daysUntilDue < 2) {
        availabilityScore -= 20; // Urgent tasks are harder to fit in
      } else if (daysUntilDue > 14) {
        availabilityScore += 10; // Plenty of time
      }

      return Math.max(20, Math.min(100, availabilityScore));
    } catch (error) {
      console.error('Error calculating availability score:', error);
      return 70; // Default score
    }
  }

  /**
   * Calculate skill match score based on task content and user history
   */
  private async calculateSkillMatchScore(userId: number, title: string, description: string): Promise<number> {
    try {
      const content = `${title} ${description}`.toLowerCase();
      
      // Get user's completed tasks to analyze skill patterns
      const userTasks = await Models.Task.findAll({
        include: [{
          model: Models.User,
          as: 'assignedUsers',
          where: { id: userId },
          required: true
        }],
        where: { status: 'completed' },
        limit: 10,
        order: [['id', 'DESC']]
      });

      if (userTasks.length === 0) {
        return 60; // Default score for new users
      }

      // Extract keywords from current task
      // const taskKeywords = this.extractKeywords(content);
      
      // Calculate similarity with user's previous tasks
      let totalSimilarity = 0;
      let taskCount = 0;

      for (const task of userTasks) {
        const taskContent = `${task.title} ${task.description}`.toLowerCase();
        const similarity = this.calculateContentSimilarity(content, taskContent);
        totalSimilarity += similarity;
        taskCount++;
      }

      const avgSimilarity = taskCount > 0 ? totalSimilarity / taskCount : 0;
      const skillMatchScore = Math.round(Math.min(100, Math.max(30, avgSimilarity * 100)));

      return skillMatchScore;
    } catch (error) {
      console.error('Error calculating skill match score:', error);
      return 60; // Default score
    }
  }

  /**
   * Calculate priority handling score based on user's success with similar priority tasks
   */
  private async calculatePriorityHandlingScore(userId: number, priority: string): Promise<number> {
    try {
      const priorityTasks = await Models.Task.findAll({
        include: [{
          model: Models.User,
          as: 'assignedUsers',
          where: { id: userId },
          required: true
        }],
        where: { 
          priority: priority,
          status: 'completed'
        },
        limit: 10
      });

      if (priorityTasks.length === 0) {
        return 70; // Default score
      }

      // Get completion records for these priority tasks
      const completionRecords = await Models.TaskCompletion.findAll({
        where: {
          userId,
          taskId: { [Op.in]: priorityTasks.map(t => t.id) }
        }
      });

      if (completionRecords.length === 0) {
        return 70; // Default score
      }

      // Calculate average efficiency for this priority level
      const avgEfficiency = completionRecords.reduce((sum, comp) => sum + comp.efficiency, 0) / completionRecords.length;
      
      // Convert efficiency to score (efficiency of 1.0+ is good)
      const priorityScore = Math.min(100, Math.max(30, avgEfficiency * 70));

      return Math.round(priorityScore);
    } catch (error) {
      console.error('Error calculating priority handling score:', error);
      return 70; // Default score
    }
  }

  /**
   * Extract keywords from text content
   */
  private extractKeywords(content: string): string[] {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    
    return content
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 10); // Top 10 keywords
  }

  /**
   * Calculate content similarity between two texts
   */
  private calculateContentSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.extractKeywords(text1));
    const words2 = new Set(this.extractKeywords(text2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Get recommendation level based on weighted score
   */
  private getRecommendationLevel(score: number): 'highly-recommended' | 'recommended' | 'suitable' | 'not-recommended' {
    if (score >= 85) return 'highly-recommended';
    if (score >= 70) return 'recommended';
    if (score >= 50) return 'suitable';
    return 'not-recommended';
  }

  /**
   * Generate human-readable reason text
   */
  private generateReasonText(factors: {
    performanceScore: number;
    workloadScore: number;
    availabilityScore: number;
    skillMatchScore: number;
    priorityHandlingScore: number;
  }, recommendation: string): string {
    const reasons: string[] = [];

    if (factors.performanceScore >= 80) {
      reasons.push('excellent track record');
    } else if (factors.performanceScore >= 60) {
      reasons.push('good performance history');
    }

    if (factors.workloadScore >= 80) {
      reasons.push('low current workload');
    } else if (factors.workloadScore < 40) {
      reasons.push('high current workload');
    }

    if (factors.availabilityScore >= 80) {
      reasons.push('good availability');
    } else if (factors.availabilityScore < 50) {
      reasons.push('limited availability');
    }

    if (factors.skillMatchScore >= 70) {
      reasons.push('relevant experience');
    }

    if (factors.priorityHandlingScore >= 80) {
      reasons.push('strong with this priority level');
    }

    if (reasons.length === 0) {
      return recommendation === 'not-recommended' ? 'May not be the best fit' : 'Suitable for assignment';
    }

    return reasons.join(', ');
  }
}