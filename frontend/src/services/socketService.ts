/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import { authService } from './authService';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket;
    }

    try {
      this.socket = io('http://localhost:3001', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.reconnectAttempts = 0;
        
        // Join user-specific room
        const user = authService.getCurrentUser();
        if (user) {
          this.socket?.emit('join-user', user.id);
          
          // Join admin room if user is admin
          if (user.role === 'admin') {
            this.socket?.emit('join-admin');
          }
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.handleReconnect();
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to connect to socket server:', error);
      return null;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, 2000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Task event listeners
  onTaskCreated(callback: (task: any) => void) {
    this.socket?.on('task-created', callback);
  }

  onTaskUpdated(callback: (task: any) => void) {
    this.socket?.on('task-updated', callback);
  }

  onTaskDeleted(callback: (data: { id: number; task: any }) => void) {
    this.socket?.on('task-deleted', callback);
  }

  onTaskCompleted(callback: (task: any) => void) {
    this.socket?.on('task-completed', callback);
  }

  // Remove event listeners
  offTaskCreated(callback?: (task: any) => void) {
    this.socket?.off('task-created', callback);
  }

  offTaskUpdated(callback?: (task: any) => void) {
    this.socket?.off('task-updated', callback);
  }

  offTaskDeleted(callback?: (data: { id: number; task: any }) => void) {
    this.socket?.off('task-deleted', callback);
  }

  offTaskCompleted(callback?: (task: any) => void) {
    this.socket?.off('task-completed', callback);
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();