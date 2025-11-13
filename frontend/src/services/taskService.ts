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

  async completeTask(id: number) {
    return api.patch(`/task/${id}/complete`, {});
  },

  async bulkUpdateTasks(ids: number[], data: UpdateTaskData) {
    return api.post('/task/bulk-update', { ids, data });
  },

  async bulkDeleteTasks(ids: number[]) {
    return api.post('/task/bulk-delete', { ids });
  },
};
