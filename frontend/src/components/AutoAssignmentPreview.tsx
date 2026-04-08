import React, { useState, useEffect } from 'react';
import { taskService, type UserSuitabilityScore } from '../types';
import { User, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface AutoAssignmentPreviewProps {
  taskData: {
    title: string;
    description: string;
    priority?: string;
    dueDate?: string;
  };
  onRecommendationReady: (userId: number | null) => void;
}

export const AutoAssignmentPreview: React.FC<AutoAssignmentPreviewProps> = ({
  taskData,
  onRecommendationReady,
}) => {
  const [recommendations, setRecommendations] = useState<UserSuitabilityScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<UserSuitabilityScore | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    if (taskData.title && taskData.description) {
      fetchRecommendations();
      setIsApproved(false);
    }
  }, [taskData.title, taskData.description, taskData.priority, taskData.dueDate]);

  const fetchRecommendations = async () => {
    if (!taskData.title.trim() || !taskData.description.trim()) return;
    
    setLoading(true);
    try {
      const response = await taskService.getUserRecommendations(taskData);
      
      if (response.data) {
        const backendResponse = response.data as any;
        const recommendationsData = backendResponse.data || [];
        
        if (Array.isArray(recommendationsData) && recommendationsData.length > 0) {
          setRecommendations(recommendationsData);
          const topRec = recommendationsData[0]; // Highest scored user
          setSelectedRecommendation(topRec);
          onRecommendationReady(topRec.userId);
        } else {
          setRecommendations([]);
          setSelectedRecommendation(null);
          onRecommendationReady(null);
        }
      } else {
        setRecommendations([]);
        setSelectedRecommendation(null);
        onRecommendationReady(null);
      }
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
      setRecommendations([]);
      setSelectedRecommendation(null);
      onRecommendationReady(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (recommendation: UserSuitabilityScore) => {
    setSelectedRecommendation(recommendation);
    setIsApproved(false); // Reset approval when changing user
    onRecommendationReady(recommendation.userId);
  };

  const handleApprove = () => {
    setIsApproved(true);
  };

  const handleRefresh = () => {
    fetchRecommendations();
  };

  if (loading) {
    return (
      <div className="auto-assignment-preview">
        <div className="auto-assignment-header">
          <User size={18} className="text-blue-600" />
          <h4>Auto Assignment</h4>
        </div>
        <div className="loading-small">Finding best user for this task...</div>
      </div>
    );
  }

  if (!selectedRecommendation) {
    return (
      <div className="auto-assignment-preview">
        <div className="auto-assignment-header">
          <User size={18} className="text-gray-600" />
          <h4>Auto Assignment</h4>
        </div>
        <div className="no-recommendation">
          <AlertCircle size={16} className="text-orange-600" />
          <span>No suitable users found for this task</span>
        </div>
      </div>
    );
  }

  return (
    <div className="auto-assignment-preview">
      <div className="auto-assignment-header">
        <User size={18} className="text-blue-600" />
        <h4>Auto Assignment</h4>
        <button
          type="button"
          onClick={handleRefresh}
          className="btn-icon btn-sm"
          title="Refresh recommendation"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      
      <div className={`recommended-user ${isApproved ? 'approved' : ''}`}>
        <div className="user-info">
          <div className="user-name">
            {selectedRecommendation.user.firstName} {selectedRecommendation.user.lastName}
          </div>
          <div className="user-score">
            {selectedRecommendation.score}% match
          </div>
        </div>
        
        <div className="recommendation-details">
          <span className={`recommendation-level ${selectedRecommendation.recommendation}`}>
            {selectedRecommendation.recommendation === 'highly-recommended' ? 'Highly Recommended' :
             selectedRecommendation.recommendation === 'recommended' ? 'Recommended' :
             selectedRecommendation.recommendation === 'suitable' ? 'Suitable' : 'Not Recommended'}
          </span>
          <span className="recommendation-reason">
            {selectedRecommendation.reasonText}
          </span>
        </div>
        
        {!isApproved ? (
          <button
            type="button"
            onClick={handleApprove}
            className="btn btn-sm btn-primary approve-btn"
          >
            <CheckCircle size={16} />
            Approve Assignment
          </button>
        ) : (
          <div className="approved-indicator">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-green-600">Assignment Approved</span>
          </div>
        )}
      </div>
      
      {recommendations.length > 1 && (
        <div className="other-recommendations">
          <details>
            <summary>View other recommendations ({recommendations.length - 1})</summary>
            <div className="other-users-list">
              {recommendations.filter(rec => rec.userId !== selectedRecommendation?.userId).slice(0, 3).map((rec) => (
                <div 
                  key={rec.userId} 
                  className="other-user clickable"
                  onClick={() => handleSelectUser(rec)}
                  title={`Click to select ${rec.user.firstName} ${rec.user.lastName} (${rec.score}% match)`}
                >
                  <div className="other-user-info">
                    <span className="other-user-name">
                      {rec.user.firstName} {rec.user.lastName}
                    </span>
                    <span className="other-user-details">
                      {rec.score}% • {rec.recommendation === 'highly-recommended' ? 'Highly Recommended' :
                       rec.recommendation === 'recommended' ? 'Recommended' :
                       rec.recommendation === 'suitable' ? 'Suitable' : 'Not Recommended'}
                    </span>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-xs btn-outline select-user-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectUser(rec);
                    }}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};