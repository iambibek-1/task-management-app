import React, { useState, useEffect } from 'react';
import { taskService, type UserSuitabilityScore } from '../types';

interface SmartUserSelectionProps {
  users: any[];
  selectedUserIds: number[];
  onUserSelection: (userId: number) => void;
  taskData: {
    title: string;
    description: string;
    priority?: string;
    dueDate?: string;
  };
}

export const SmartUserSelection: React.FC<SmartUserSelectionProps> = ({
  users,
  selectedUserIds,
  onUserSelection,
  taskData,
}) => {
  const [userRecommendations, setUserRecommendations] = useState<UserSuitabilityScore[]>([]);
  const [sortedUsers, setSortedUsers] = useState<any[]>([]);

  useEffect(() => {
    if (taskData.title && taskData.description && users.length > 0) {
      fetchUserRecommendations();
    }
  }, [taskData.title, taskData.description, taskData.priority, taskData.dueDate]);

  useEffect(() => {
    if (userRecommendations.length > 0) {
      const usersWithScores = users.map(user => {
        const recommendation = userRecommendations.find(rec => rec.userId === user.id);
        return {
          ...user,
          recommendation: recommendation || null
        };
      });

      const sorted = usersWithScores.sort((a, b) => {
        if (a.recommendation && b.recommendation) {
          return b.recommendation.score - a.recommendation.score;
        }
        if (a.recommendation && !b.recommendation) return -1;
        if (!a.recommendation && b.recommendation) return 1;
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      });

      setSortedUsers(sorted);
    } else {
      setSortedUsers(users);
    }
  }, [users, userRecommendations]);

  const fetchUserRecommendations = async () => {
    if (!taskData.title.trim() || !taskData.description.trim()) return;
    
    try {
      const response = await taskService.getUserRecommendations(taskData);
      if (response.data) {
        const backendResponse = response.data as any;
        const recommendationsData = backendResponse.data || [];
        
        if (Array.isArray(recommendationsData)) {
          setUserRecommendations(recommendationsData);
        } else {
          setUserRecommendations([]);
        }
      } else {
        setUserRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
      setUserRecommendations([]);
    }
  };

  const getPercentageColorClass = (score: number): string => {
    if (score >= 80) return 'high-percentage'; // Red for high percentage
    if (score >= 60) return 'medium-percentage'; // Green for medium percentage
    return 'low-percentage'; // Yellow for low percentage
  };

  return (
    <div className="assign-to-section">
      <label className="assign-to-label">Assign To</label>
      <div className="user-selection-list">
        {sortedUsers.map((user) => {
          const userRec = user.recommendation;
          const isSelected = selectedUserIds.includes(user.id);
          
          return (
            <div 
              key={user.id} 
              className={`user-selection-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onUserSelection(user.id)}
            >
              <div className="user-selection-left">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onUserSelection(user.id)}
                  className="user-checkbox"
                />
                <span className="user-display-name">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              
              {userRec && (
                <div className="recommendation-badge">
                  <span className="recommendation-percentage">{userRec.score}%</span>
                  <span className={`recommendation-text ${getPercentageColorClass(userRec.score)}`}>
                    {userRec.recommendation === 'highly-recommended' ? 'Highly Recommended' :
                     userRec.recommendation === 'recommended' ? 'Recommended' :
                     userRec.recommendation === 'suitable' ? 'Suitable' : 'Not Recommended'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};