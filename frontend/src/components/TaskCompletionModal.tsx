import React, { useState } from 'react';
import { Modal } from './Modal';
import { CheckCircle, FileText } from 'lucide-react';

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { notes?: string }) => void;
  taskTitle: string;
  isCompleting?: boolean;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  taskTitle,
  isCompleting = false,
}) => {
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const completionData: { notes?: string } = {};
    
    if (notes.trim()) {
      completionData.notes = notes.trim();
    }
    
    onComplete(completionData);
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Complete Task">
      <form onSubmit={handleSubmit} className="form">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} className="text-green-600" />
            <h3 className="font-medium">Completing: {taskTitle}</h3>
          </div>
          <p className="text-sm text-gray-600">
            Time spent will be automatically calculated based on task creation and completion time.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="flex items-center gap-2">
            <FileText size={16} />
            Completion Notes (optional)
          </label>
          <textarea
            id="notes"
            placeholder="Any notes about the task completion..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleClose} 
            className="btn btn-secondary"
            disabled={isCompleting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-success"
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <span className="spinner"></span>
                Completing...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Mark Complete
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};