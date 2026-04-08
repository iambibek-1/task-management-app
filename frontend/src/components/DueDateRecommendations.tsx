import React, { useState, useEffect } from 'react';
import { taskService, type TaskRecommendation } from '../types';
import { Calendar, Check } from 'lucide-react';

interface DueDateRecommendationsProps {
  taskData: {
    title: string;
    description: string;
    priority?: string;
    assignedUserIds?: number[];
  };
  onApplyRecommendation?: (type: string, data: any) => void;
}

export const DueDateRecommendations: React.FC<DueDateRecommendationsProps> = ({
  taskData,
  onApplyRecommendation,
}) => {
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (taskData.title && taskData.description) {
      fetchRecommendations();
      setAppliedRecommendations(new Set());
    }
  }, [taskData.title, taskData.description, taskData.priority]);

  const fetchRecommendations = async () => {
    if (!taskData.title.trim() || !taskData.description.trim()) return;
    
    setLoading(true);
    try {
      const response = await taskService.getTaskRecommendations(taskData);
      
      if (response.data) {
        const backendResponse = response.data as any;
        const recommendationsData = backendResponse.data || [];
        
        if (Array.isArray(recommendationsData)) {
          // Filter only due date recommendations
          const dueDateRecs = recommendationsData.filter(rec => rec.type === 'due_date');
          setRecommendations(dueDateRecs);
        } else {
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching due date recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRecommendation = (recommendation: TaskRecommendation, index: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (onApplyRecommendation) {
      onApplyRecommendation(recommendation.type, recommendation.data);
      setAppliedRecommendations(prev => new Set([...prev, index]));
    }
  };

  if (loading) {
    return (
      <div className="due-date-recommendations">
        <div className="loading-small">Getting due date suggestions...</div>
      </div>
    );
  }

  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="due-date-recommendations">
      {recommendations.map((rec, index) => (
        <div key={index} className="due-date-recommendation-item">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-600" />
            <span className="recommendation-message-small">{rec.message}</span>
          </div>
          
          {rec.data && onApplyRecommendation && (
            appliedRecommendations.has(index) ? (
              <div className="applied-indicator-small">
                <Check size={14} className="text-green-600" />
                <span className="text-green-600 text-sm">Applied</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => handleApplyRecommendation(rec, index, e)}
                className="btn btn-xs btn-outline"
              >
                Apply
              </button>
            )
          )}
        </div>
      ))}
    </div>
  );
};