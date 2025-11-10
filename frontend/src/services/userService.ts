import { api } from './api';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
}

export const userService = {
  async getUsers() {
    return api.get<User[]>('/user');
  },

  async createUser(data: CreateUserData) {
    return api.post<User>('/user', data);
  },

  async updateUser(id: number, data: UpdateUserData) {
    return api.patch<User>(`/user/${id}`, data);
  },

  async deleteUser(id: number) {
    return api.delete(`/user/${id}`);
  },
};
