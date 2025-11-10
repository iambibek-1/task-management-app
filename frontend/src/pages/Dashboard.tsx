import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import type { Task } from '../services/taskService';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';

export const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    incomplete: 0,
    overdue: 0,
    highPriority: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const response = await taskService.getTasks();
    setLoading(false);

    if (response.data) {
      const tasksData = (response.data as any).data || response.data;
      const tasksList = Array.isArray(tasksData) ? tasksData : [];
      setTasks(tasksList);

      // Calculate stats
      const now = new Date();
      const completed = tasksList.filter((t: Task) => t.status === 'completed').length;
      const inProgress = tasksList.filter((t: Task) => t.status === 'inProgress').length;
      const incomplete = tasksList.filter((t: Task) => t.status === 'incompleted').length;
      const overdue = tasksList.filter((t: Task) => 
        t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
      ).length;
      const highPriority = tasksList.filter((t: Task) => t.priority === 'high').length;

      setStats({
        total: tasksList.length,
        completed,
        inProgress,
        incomplete,
        overdue,
        highPriority,
      });
    }
  };

  const getRecentTasks = () => {
    // Sort by ID (most recent first) since we don't have createdAt
    return tasks
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  };

  const getUpcomingTasks = () => {
    const now = new Date();
    return tasks
      .filter(t => t.dueDate && new Date(t.dueDate) > now && t.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/tasks" className="btn btn-primary">
          View All Tasks
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <BarChart3 size={24} color="#1e40af" />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <CheckCircle size={24} color="#065f46" />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <Clock size={24} color="#92400e" />
          </div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>
            <AlertCircle size={24} color="#991b1b" />
          </div>
          <div className="stat-content">
            <h3>{stats.overdue}</h3>
            <p>Overdue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fce7f3' }}>
            <TrendingUp size={24} color="#9f1239" />
          </div>
          <div className="stat-content">
            <h3>{stats.highPriority}</h3>
            <p>High Priority</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff' }}>
            <Users size={24} color="#4338ca" />
          </div>
          <div className="stat-content">
            <h3>{stats.incomplete}</h3>
            <p>Incomplete</p>
          </div>
        </div>
      </div>

      {/* Recent and Upcoming Tasks */}
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>
            <Clock size={20} />
            Recent Tasks
          </h2>
          {getRecentTasks().length === 0 ? (
            <p className="empty-message">No recent tasks</p>
          ) : (
            <div className="task-list">
              {getRecentTasks().map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-item-header">
                    <h4>{task.title}</h4>
                    <span className={`badge ${task.priority === 'high' ? 'priority-high' : task.priority === 'medium' ? 'priority-medium' : 'priority-low'}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="task-item-desc">{task.description.substring(0, 100)}{task.description.length > 100 ? '...' : ''}</p>
                  <div className="task-item-footer">
                    <span className={`badge ${task.status === 'completed' ? 'status-completed' : task.status === 'inProgress' ? 'status-progress' : 'status-incomplete'}`}>
                      {task.status}
                    </span>
                    {task.assignedUsers && task.assignedUsers.length > 0 && (
                      <span className="badge">
                        👥 {task.assignedUsers.length} assigned
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>
            <Calendar size={20} />
            Upcoming Deadlines
          </h2>
          {getUpcomingTasks().length === 0 ? (
            <p className="empty-message">No upcoming deadlines</p>
          ) : (
            <div className="task-list">
              {getUpcomingTasks().map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-item-header">
                    <h4>{task.title}</h4>
                    <span className={`badge ${task.priority === 'high' ? 'priority-high' : task.priority === 'medium' ? 'priority-medium' : 'priority-low'}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="task-item-desc">{task.description.substring(0, 100)}{task.description.length > 100 ? '...' : ''}</p>
                  <div className="task-item-footer">
                    <span className="due-date">
                      <Calendar size={14} />
                      Due: {new Date(task.dueDate!).toLocaleDateString()}
                    </span>
                    {task.assignedUsers && task.assignedUsers.length > 0 && (
                      <span className="badge">
                        👥 {task.assignedUsers.map(u => u.firstName).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
