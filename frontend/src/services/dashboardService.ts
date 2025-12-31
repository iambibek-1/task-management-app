/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './api';

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  incompleteTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  tasksByCategory: { category: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  recentActivity: any[];
}

export const dashboardService = {
  async getStats() {
    return api.get<DashboardStats>('/dashboard/stats');
  },
};
