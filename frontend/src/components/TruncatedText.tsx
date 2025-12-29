import { useState, useEffect } from 'react';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export const TruncatedText = ({ text, maxLength = 100, className = '' }: TruncatedTextProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Handle empty or null text
  if (!text) {
    return <span className={className}>No description</span>;
  }
  
  // If text is shorter than maxLength, show it as is
  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }
  
  // Close tooltip on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showTooltip) {
        setShowTooltip(false);
      }
    };
    
    if (showTooltip) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showTooltip]);
  
  // Find a good breaking point (end of word) near maxLength
  const truncatedText = text.slice(0, maxLength);
  const lastSpaceIndex = truncatedText.lastIndexOf(' ');
  const finalTruncatedText = lastSpaceIndex > maxLength * 0.8 
    ? truncatedText.slice(0, lastSpaceIndex) 
    : truncatedText;
  
  return (
    <div className="truncated-text-container">
      <span className={className}>
        {finalTruncatedText}
        <button
          onClick={() => setShowTooltip(true)}
          className="text-expand-btn"
          type="button"
          aria-label="Show full text"
        >
          ...more
        </button>
      </span>
      
      {showTooltip && (
        <div className="text-tooltip-overlay" onClick={() => setShowTooltip(false)}>
          <div className="text-tooltip" onClick={(e) => e.stopPropagation()}>
            <div className="text-tooltip-header">
              <h4>Full Description</h4>
              <button 
                onClick={() => setShowTooltip(false)}
                className="text-tooltip-close"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="text-tooltip-content">
              {text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};