import React, { useState, useEffect } from 'react';
import { taskService, type TaskRecommendation } from '../types';
import { Lightbulb, TrendingUp, Clock, Users, Calendar, AlertCircle, Check } from 'lucide-react';

interface TaskRecommendationsProps {
  taskData: {
    title: string;
    description: string;
    priority?: string;
    assignedUserIds?: number[];
  };
  onApplyRecommendation?: (type: string, data: any) => void;
}

export const TaskRecommendations: React.FC<TaskRecommendationsProps> = ({
  taskData,
  onApplyRecommendation,
}) => {
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (taskData.title && taskData.description) {
      fetchRecommendations();
      // Reset applied recommendations when task data changes
      setAppliedRecommendations(new Set());
    }
  }, [taskData.title, taskData.description, taskData.priority]);

  const fetchRecommendations = async () => {
    if (!taskData.title.trim() || !taskData.description.trim()) return;
    
    setLoading(true);
    try {
      const response = await taskService.getTaskRecommendations(taskData);
      
      if (response.data) {
        // The API returns { success, status, message, data: recommendations }
        // The api service wraps this in { data: backendResponse }
        const backendResponse = response.data as any;
        const recommendationsData = backendResponse.data || [];
        
        // Ensure we have an array
        if (Array.isArray(recommendationsData)) {
          setRecommendations(recommendationsData);
        } else {
          console.warn('Recommendations data is not an array:', recommendationsData);
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'priority':
        return <TrendingUp size={16} />;
      case 'time_estimate':
        return <Clock size={16} />;
      case 'user_assignment':
        return <Users size={16} />;
      case 'due_date':
        return <Calendar size={16} />;
      default:
        return <Lightbulb size={16} />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-blue-600';
    if (confidence >= 0.4) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
  };

  const handleApplyRecommendation = (recommendation: TaskRecommendation, index: number, event: React.MouseEvent) => {
    // Prevent any form submission or event bubbling
    event.preventDefault();
    event.stopPropagation();
    
    if (onApplyRecommendation) {
      onApplyRecommendation(recommendation.type, recommendation.data);
      // Mark this recommendation as applied
      setAppliedRecommendations(prev => new Set([...prev, index]));
    }
  };

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} />
          <h4>AI Recommendations</h4>
        </div>
        <div className="loading-small">Analyzing task...</div>
      </div>
    );
  }

  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendations-container">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={18} className="text-yellow-600" />
        <h4>AI Recommendations</h4>
      </div>
      
      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div key={index} className="recommendation-item">
            <div className="recommendation-header">
              <div className="flex items-center gap-2">
                {getRecommendationIcon(rec.type)}
                <span className="recommendation-type">
                  {rec.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              {/* Only show confidence badge if it's meaningful (not default/low confidence) */}
              {rec.confidence >= 0.7 && (
                <div className={`confidence-badge ${getConfidenceColor(rec.confidence)}`}>
                  {getConfidenceLabel(rec.confidence)} ({Math.round(rec.confidence * 100)}%)
                </div>
              )}
            </div>
            
            <p className="recommendation-message">{rec.message}</p>
            
            {rec.data && onApplyRecommendation && (
              appliedRecommendations.has(index) ? (
                <div className="applied-indicator">
                  <Check size={16} className="text-green-600" />
                  <span className="text-green-600">Applied</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleApplyRecommendation(rec, index, e)}
                  className="btn btn-sm btn-outline"
                >
                  Apply Suggestion
                </button>
              )
            )}
          </div>
        ))}
      </div>
      
      <div className="recommendation-disclaimer">
        <AlertCircle size={14} />
        <span>Recommendations are AI-generated based on task content and historical data.</span>
      </div>
    </div>
  );
};