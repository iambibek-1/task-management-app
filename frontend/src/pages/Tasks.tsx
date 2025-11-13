import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import type { Task, CreateTaskData } from '../services/taskService';
import { Modal } from '../components/Modal';
import { Notification } from '../components/Notification';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Plus, Edit2, Trash2, Filter, CheckCircle } from 'lucide-react';

export const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; taskId: number | null; taskTitle: string }>({
    isOpen: false,
    taskId: null,
    taskTitle: '',
  });
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
  }, [loadTasks, loadUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        <h1>Tasks</h1>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={20} />
          Add Task
        </button>
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
                  <button onClick={() => openModal(task)} className="btn-icon" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => openDeleteConfirm(task)} className="btn-icon btn-danger" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="card-description">{task.description}</p>
              
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
            <button type="button" onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTask ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
