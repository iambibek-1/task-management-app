import React from 'react';

interface SimpleUserSelectionProps {
  users: any[];
  selectedUserIds: number[];
  onUserSelection: (userId: number) => void;
}

export const SimpleUserSelection: React.FC<SimpleUserSelectionProps> = ({
  users,
  selectedUserIds,
  onUserSelection,
}) => {
  return (
    <div className="user-selection-container">
      <label className="form-label">Assign To Users</label>
      
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <label className="user-checkbox">
              <input
                type="checkbox"
                checked={selectedUserIds.includes(user.id)}
                onChange={() => onUserSelection(user.id)}
              />
              <div className="user-details">
                <div className="user-name">
                  {user.firstName} {user.lastName}
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
      
      {selectedUserIds.length > 0 && (
        <div className="selected-count">
          Selected: {selectedUserIds.length} user(s)
        </div>
      )}
    </div>
  );
};