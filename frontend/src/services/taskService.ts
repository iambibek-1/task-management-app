/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './api';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'inProgress' | 'incompleted';
  priority: 'low' | 'medium' | 'high';
  assignedUsers?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status?: 'completed' | 'inProgress' | 'incompleted';
  priority?: 'low' | 'medium' | 'high';
  assignedUserIds?: number[];
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'completed' | 'inProgress' | 'incompleted';
  priority?: 'low' | 'medium' | 'high';
  assignedUserIds?: number[];
  dueDate?: string;
}

export interface TaskRecommendation {
  type: 'priority' | 'time_estimate' | 'user_assignment' | 'due_date';
  message: string;
  confidence: number;
  data?: any;
}

export interface TaskCompletionRecord {
  id: number;
  taskId: number;
  userId: number;
  completedAt: string;
  timeSpentHours: number;
  efficiency: number;
  notes?: string;
  task: {
    id: number;
    title: string;
    priority: string;
    estimatedHours?: number;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface UserPerformanceAnalytics {
  completedTasks: number;
  averageEfficiency: number;
  averageTimeSpent: number;
  onTimeCompletionRate: number;
}

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  incompleteTasks: number;
  overdueTasks: number;
  completionRate: number;
  avgTimeSpentHours: number;
  avgEfficiency: number;
}

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

export const taskService = {
  async getTasks(params?: {
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: number;
    dueDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return api.get<Task[]>(`/task${query ? `?${query}` : ''}`);
  },

  async getTasksByPriority(priority: 'low' | 'medium' | 'high') {
    return api.get<Task[]>(`/task/priority/${priority}`);
  },

  async getMyTasks() {
    return api.get<Task[]>('/task/my-tasks');
  },

  async getTasksByCategory(category: string) {
    return api.get<Task[]>(`/task/category/${category}`);
  },

  async getOverdueTasks() {
    return api.get<Task[]>('/task/overdue');
  },

  async createTask(data: CreateTaskData) {
    return api.post<Task>('/task', data);
  },

  async updateTask(id: number, data: UpdateTaskData) {
    return api.put<Task>(`/task/${id}`, data);
  },

  async deleteTask(id: number) {
    return api.delete(`/task/${id}`);
  },

  async completeTask(id: number, data?: { notes?: string }) {
    return api.patch(`/task/${id}/complete`, data || {});
  },

  async getTaskRecommendations(taskData: {
    title: string;
    description: string;
    priority?: string;
    assignedUserIds?: number[];
  }) {
    return api.post<TaskRecommendation[]>('/task/recommendations', taskData);
  },

  async getUserPerformanceAnalytics(userId?: number) {
    const endpoint = userId ? `/task/user-analytics/${userId}` : '/task/user-analytics';
    return api.get<UserPerformanceAnalytics>(endpoint);
  },

  async getTaskCompletionRecords(filters?: {
    userId?: number;
    taskId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return api.get<TaskCompletionRecord[]>(`/task/completion-records${query ? `?${query}` : ''}`);
  },

  async getTaskAnalytics() {
    return api.get<TaskAnalytics>('/task/analytics');
  },

  async getUserRecommendations(taskData: {
    title: string;
    description: string;
    priority?: string;
    dueDate?: string;
  }) {
    return api.post<UserSuitabilityScore[]>('/task/user-recommendations', taskData);
  },

  async bulkUpdateTasks(ids: number[], data: UpdateTaskData) {
    return api.post('/task/bulk-update', { ids, data });
  },

  async bulkDeleteTasks(ids: number[]) {
    return api.post('/task/bulk-delete', { ids });
  },
};
