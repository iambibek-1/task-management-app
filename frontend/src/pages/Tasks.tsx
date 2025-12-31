/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import type { Task, CreateTaskData } from '../services/taskService';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';
import { Modal } from '../components/Modal';
import { Notification } from '../components/Notification';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TruncatedText } from '../components/TruncatedText';
import { Plus, Edit2, Trash2, Filter, CheckCircle, Wifi, WifiOff } from 'lucide-react';

export const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; taskId: number | null; taskTitle: string }>({
    isOpen: false,
    taskId: null,
    taskTitle: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    status: 'incompleted',
    priority: 'low',
    dueDate: '',
    assignedUserIds: [],
  });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const response = filterPriority === 'all'
      ? await taskService.getTasks()
      : await taskService.getTasksByPriority(filterPriority);
    
    setLoading(false);
    if (response.data) {
      // Backend returns { data: tasks }, so we need response.data.data
      const tasksData = (response.data as any).data || response.data;
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } else if (response.error) {
      setNotification({ message: response.error, type: 'error' });
    }
  }, [filterPriority]);

  const loadUsers = useCallback(async () => {
    const { userService } = await import('../services/userService');
    const response = await userService.getUsers();
    if (response.data) {
      const usersData = (response.data as any).data || response.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadUsers();
    
    // Initialize socket connection
    const socket = socketService.connect();
    if (socket) {
      setIsConnected(socketService.isConnected());
      
      // Socket event handlers
      const handleTaskCreated = (task: Task) => {
        setTasks(prevTasks => [task, ...prevTasks]);
        setNotification({ message: `New task "${task.title}" created!`, type: 'info' });
      };
      
      const handleTaskUpdated = (updatedTask: Task) => {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        );
        setNotification({ message: `Task "${updatedTask.title}" updated!`, type: 'info' });
      };
      
      const handleTaskDeleted = (data: { id: number; task: Task }) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== data.id));
        setNotification({ message: `Task "${data.task.title}" deleted!`, type: 'info' });
      };
      
      const handleTaskCompleted = (completedTask: Task) => {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === completedTask.id ? completedTask : task
          )
        );
        setNotification({ message: `Task "${completedTask.title}" completed!`, type: 'success' });
      };
      
      // Register event listeners
      socketService.onTaskCreated(handleTaskCreated);
      socketService.onTaskUpdated(handleTaskUpdated);
      socketService.onTaskDeleted(handleTaskDeleted);
      socketService.onTaskCompleted(handleTaskCompleted);
      
      // Connection status listeners
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      
      // Cleanup function
      return () => {
        socketService.offTaskCreated(handleTaskCreated);
        socketService.offTaskUpdated(handleTaskUpdated);
        socketService.offTaskDeleted(handleTaskDeleted);
        socketService.offTaskCompleted(handleTaskCompleted);
        socket.off('connect');
        socket.off('disconnect');
      };
    }
  }, [loadTasks, loadUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    if (editingTask) {
      const response = await taskService.updateTask(editingTask.id, formData);
      if (response.error) {
        setNotification({ message: response.error, type: 'error' });
      } else {
        setNotification({ message: 'Task updated successfully!', type: 'success' });
        loadTasks();
        closeModal();
      }
    } else {
      const response = await taskService.createTask(formData);
      if (response.error) {
        setNotification({ message: response.error, type: 'error' });
      } else {
        setNotification({ message: 'Task created successfully!', type: 'success' });
        loadTasks();
        closeModal();
      }
    }
    
    setIsCreating(false);
  };

  const openDeleteConfirm = (task: Task) => {
    setDeleteConfirm({
      isOpen: true,
      taskId: task.id,
      taskTitle: task.title,
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({
      isOpen: false,
      taskId: null,
      taskTitle: '',
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.taskId) return;
    
    const response = await taskService.deleteTask(deleteConfirm.taskId);
    if (response.error) {
      setNotification({ message: response.error, type: 'error' });
    } else {
      setNotification({ message: 'Task deleted successfully!', type: 'success' });
      loadTasks();
    }
  };

  const handleComplete = async (taskId: number, taskTitle: string) => {
    const response = await taskService.completeTask(taskId);
    if (response.error) {
      setNotification({ message: response.error, type: 'error' });
    } else {
      setNotification({ message: `"${taskTitle}" marked as completed!`, type: 'success' });
      loadTasks();
    }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignedUserIds: task.assignedUsers?.map(u => u.id) || [],
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'incompleted',
        priority: 'low',
        dueDate: '',
        assignedUserIds: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleUserSelection = (userId: number) => {
    const currentIds = formData.assignedUserIds || [];
    if (currentIds.includes(userId)) {
      setFormData({
        ...formData,
        assignedUserIds: currentIds.filter(id => id !== userId),
      });
    } else {
      setFormData({
        ...formData,
        assignedUserIds: [...currentIds, userId],
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setIsCreating(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'inProgress': return 'status-progress';
      case 'incompleted': return 'status-incomplete';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h1>{isAdmin ? 'All Tasks' : 'My Tasks'}</h1>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => openModal()} className="btn btn-primary">
            <Plus size={20} />
            Add Task
          </button>
        )}
      </div>

      <div className="filter-bar">
        <Filter size={20} />
        <span>Filter by priority:</span>
        <div className="filter-buttons">
          {['all', 'low', 'medium', 'high'].map((priority) => (
            <button
              key={priority}
              onClick={() => setFilterPriority(priority as any)}
              className={`btn btn-sm ${filterPriority === priority ? 'btn-primary' : 'btn-secondary'}`}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found. Create your first task!</p>
        </div>
      ) : (
        <div className="cards-grid">
          {tasks.map((task) => (
            <div key={task.id} className="card">
              <div className="card-header">
                <h3>{task.title}</h3>
                <div className="card-actions">
                  {task.status !== 'completed' && (
                    <button 
                      onClick={() => handleComplete(task.id, task.title)} 
                      className="btn-icon btn-success" 
                      title="Mark as Complete"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button onClick={() => openModal(task)} className="btn-icon" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => openDeleteConfirm(task)} className="btn-icon btn-danger" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <TruncatedText 
                text={task.description} 
                maxLength={120} 
                className="card-description" 
              />
              
              <div className="card-footer">
                <span className={`badge ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`badge ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              
              {(task.dueDate || (task.assignedUsers && task.assignedUsers.length > 0)) && (
                <div className="task-card-meta">
                  {task.dueDate && (
                    <div className="task-card-meta-item">
                      <span>📅</span>
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.assignedUsers && task.assignedUsers.length > 0 && (
                    <div className="task-card-meta-item">
                      <span>👥</span>
                      <span>
                        {task.assignedUsers.map(u => u.firstName).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${deleteConfirm.taskTitle}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Task description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="incompleted">Incomplete</option>
                <option value="inProgress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Assign To (Select multiple users)</label>
            <div className="user-selection-grid">
              {users.map((user) => (
                <label key={user.id} className="user-checkbox-label">
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={formData.assignedUserIds?.includes(user.id) || false}
                    onChange={() => handleUserSelection(user.id)}
                  />
                  <span>{user.firstName} {user.lastName}</span>
                </label>
              ))}
            </div>
            {formData.assignedUserIds && formData.assignedUserIds.length > 0 && (
              <div className="selected-users-preview">
                <small>Selected: {formData.assignedUserIds.length} user(s)</small>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={closeModal} className="btn btn-secondary" disabled={isCreating}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isCreating}>
              {isCreating ? (
                <>
                  <span className="spinner"></span>
                  {editingTask ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingTask ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
