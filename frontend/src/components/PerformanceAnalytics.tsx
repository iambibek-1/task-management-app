import React, { useState, useEffect } from 'react';
import { taskService, type UserPerformanceAnalytics, type TaskCompletionRecord } from '../types';
import { authService } from '../services/authService';
import { BarChart3, Clock, TrendingUp, Target, Calendar, Award } from 'lucide-react';

export const PerformanceAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<UserPerformanceAnalytics | null>(null);
  const [completionRecords, setCompletionRecords] = useState<TaskCompletionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadAnalytics();
    loadCompletionRecords();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await taskService.getUserPerformanceAnalytics();
      if (response.data) {
        // Handle API response format: { success, status, message, data: analytics }
        // The api service wraps this in { data: backendResponse }
        const backendResponse = response.data as any;
        const analyticsData = backendResponse.data || backendResponse;
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadCompletionRecords = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
      }

      const response = await taskService.getTaskCompletionRecords({
        userId: currentUser?.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });
      
      if (response.data) {
        // Handle API response format: { success, status, message, data: records }
        // The api service wraps this in { data: backendResponse }
        const backendResponse = response.data as any;
        const recordsData = backendResponse.data || [];
        if (Array.isArray(recordsData)) {
          setCompletionRecords(recordsData);
        } else {
          setCompletionRecords([]);
        }
      }
    } catch (error) {
      console.error('Error loading completion records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 1.2) return 'text-green-600';
    if (efficiency >= 0.8) return 'text-blue-600';
    return 'text-orange-600';
  };

  const getEfficiencyLabel = (efficiency: number) => {
    if (efficiency >= 1.2) return 'Excellent';
    if (efficiency >= 0.8) return 'Good';
    return 'Needs Improvement';
  };

  if (loading && !analytics) {
    return <div className="loading">Loading performance analytics...</div>;
  }

  return (
    <div className="performance-analytics">
      <div className="analytics-header">
        <h2>
          <BarChart3 size={24} />
          Performance Analytics
        </h2>
        <div className="time-range-selector">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {analytics && (
        <div className="analytics-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <Target size={24} color="#1e40af" />
            </div>
            <div className="stat-content">
              <h3>{analytics.completedTasks}</h3>
              <p>Tasks Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>
              <TrendingUp size={24} color="#065f46" />
            </div>
            <div className="stat-content">
              <h3 className={getEfficiencyColor(analytics.averageEfficiency)}>
                {analytics.averageEfficiency.toFixed(1)}x
              </h3>
              <p>Avg Efficiency</p>
              <small className={getEfficiencyColor(analytics.averageEfficiency)}>
                {getEfficiencyLabel(analytics.averageEfficiency)}
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <Clock size={24} color="#92400e" />
            </div>
            <div className="stat-content">
              <h3>{analytics.averageTimeSpent.toFixed(1)}h</h3>
              <p>Avg Time per Task</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e0e7ff' }}>
              <Calendar size={24} color="#4338ca" />
            </div>
            <div className="stat-content">
              <h3>{Math.round(analytics.onTimeCompletionRate * 100)}%</h3>
              <p>On-Time Completion</p>
            </div>
          </div>
        </div>
      )}

      <div className="completion-records">
        <h3>Recent Completions ({timeRange})</h3>
        {loading ? (
          <div className="loading-small">Loading records...</div>
        ) : completionRecords.length === 0 ? (
          <p className="empty-message">No completed tasks in this period</p>
        ) : (
          <div className="records-list">
            {completionRecords.map((record) => (
              <div key={record.id} className="record-item">
                <div className="record-header">
                  <h4>{record.task.title}</h4>
                  <div className="record-badges">
                    <span className={`badge ${record.task.priority === 'high' ? 'priority-high' : record.task.priority === 'medium' ? 'priority-medium' : 'priority-low'}`}>
                      {record.task.priority}
                    </span>
                    <span className={`badge ${getEfficiencyColor(record.efficiency)}`}>
                      {record.efficiency.toFixed(1)}x efficiency
                    </span>
                  </div>
                </div>
                
                <div className="record-details">
                  <div className="record-detail">
                    <Clock size={14} />
                    <span>{record.timeSpentHours}h spent</span>
                    {record.task.estimatedHours && (
                      <span className="text-gray-500">
                        (est. {record.task.estimatedHours}h)
                      </span>
                    )}
                  </div>
                  <div className="record-detail">
                    <Calendar size={14} />
                    <span>{new Date(record.completedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {record.notes && (
                  <div className="record-notes">
                    <p>"{record.notes}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {analytics && analytics.averageEfficiency >= 1.2 && (
        <div className="achievement-badge">
          <Award size={20} />
          <span>High Performer! Your efficiency is above average.</span>
        </div>
      )}
    </div>
  );
};