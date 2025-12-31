# Weighted User Suitability Scoring (WUSS) Implementation

## Overview

This implementation adds intelligent user recommendation capabilities to the task management system using the **Weighted User Suitability Scoring (WUSS)** algorithm. When creating tasks, the system now provides AI-powered recommendations for the most suitable users based on multiple performance factors.

## Features Implemented

### 1. WUSS Algorithm
The algorithm evaluates users based on 5 weighted factors:

- **Performance Score (30%)** - Historical efficiency, completion rate, and performance trends
- **Workload Score (25%)** - Current active task count and overdue tasks (lower workload = higher score)
- **Availability Score (20%)** - Schedule conflicts around due dates
- **Skill Match Score (15%)** - Content similarity with user's previous tasks
- **Priority Handling Score (10%)** - Success rate with similar priority tasks

### 2. Smart User Selection Component
- **Real-time Analysis**: Analyzes task content and provides recommendations as you type
- **Visual Indicators**: Color-coded recommendation text based on percentage scores
- **Automatic Sorting**: Most suitable users appear at the top
- **Clean UI**: Minimal design with checkbox, user name, and colored recommendation text

### 3. Recommendation Levels & Colors
- **High Percentage (≥80%)** - 🔴 Red text - "Highly Recommended"
- **Medium Percentage (60-79%)** - � GGreen text - "Recommended" 
- **Low Percentage (<60%)** - 🟡 Yellow text - "Suitable" or "Not Recommended"
- **No Data** - No recommendation badge shown

### 4. Enhanced Task Management
- **Auto Time Tracking**: Time calculated from task creation to completion
- **Efficiency Calculation**: Based on task complexity estimation vs actual time spent
- **Completion Records**: Detailed completion history with performance metrics
- **Task Analytics**: Dashboard with completion rates and efficiency trends

## How to Get High Recommendation Percentage

To achieve high recommendation scores (80%+), users need to:

### 1. **Complete Tasks Efficiently (30% weight)**
- Finish tasks faster than the estimated complexity time
- Maintain high completion rates (complete assigned tasks vs abandon them)
- Show improving performance trends over recent completions

### 2. **Maintain Low Workload (25% weight)**
- Keep active task count low (0-2 tasks = high score)
- Avoid overdue tasks (they heavily penalize the score)
- Complete tasks on time to prevent workload buildup

### 3. **Be Available (20% weight)**
- Have fewer conflicting tasks around due dates
- Accept tasks with reasonable timeframes
- Avoid scheduling conflicts

### 4. **Match Task Skills (15% weight)**
- Work on similar tasks to build expertise in specific areas
- Complete tasks with similar keywords and complexity
- Build a track record in specific domains

### 5. **Handle Priority Levels Well (10% weight)**
- Successfully complete tasks of the same priority level
- Show good efficiency with high/medium/low priority tasks
- Maintain consistent performance across priority levels

### Example Scoring:
```
User with High Score (87%):
- Performance: 92 (excellent efficiency, 100% completion rate)
- Workload: 85 (1 active task, no overdue)
- Availability: 90 (no conflicts around due date)
- Skill Match: 78 (worked on similar database tasks)
- Priority Handling: 88 (good with high priority tasks)

Final Score: (92×0.3) + (85×0.25) + (90×0.2) + (78×0.15) + (88×0.1) = 87%
```

## API Endpoints Added

### User Recommendations
```
POST /api/task/user-recommendations
```
**Body:**
```json
{
  "title": "Task title",
  "description": "Task description", 
  "priority": "high|medium|low",
  "dueDate": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "user": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "score": 87,
      "recommendation": "highly-recommended",
      "reasonText": "excellent track record, low current workload, relevant experience",
      "factors": {
        "performanceScore": 92,
        "workloadScore": 85,
        "availabilityScore": 90,
        "skillMatchScore": 78,
        "priorityHandlingScore": 88
      }
    }
  ]
}
```

### Task Recommendations (Due Date)
```
POST /api/task/recommendations
```
**Body:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "priority": "high|medium|low"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "due_date",
      "message": "Recommended due date: 1/17/2025 (2 days from now)",
      "confidence": 0.6,
      "data": {
        "suggestedDate": "2025-01-17",
        "daysFromNow": 2
      }
    }
  ]
}
```

### Task Analytics
```
GET /api/task/analytics
```

### User Performance Analytics
```
GET /api/task/user-analytics/:userId?
```

### Task Completion Records
```
GET /api/task/completion-records?userId=1&startDate=2024-01-01&endDate=2024-01-31
```

## Database Changes

### New Fields in Tasks Table
- `actualHours` - Actual time spent (auto-calculated)
- `completedAt` - When task was completed
- `createdAt` - Task creation timestamp
- `updatedAt` - Last update timestamp

### New TaskCompletions Table
- `id` - Primary key
- `taskId` - Foreign key to tasks
- `userId` - Foreign key to users
- `completedAt` - Completion timestamp
- `timeSpentHours` - Hours spent on task (auto-calculated)
- `efficiency` - Ratio of estimated vs actual time
- `notes` - Completion notes

## Due Date Recommendation System

### How It Works:
The due date recommendation is **priority-based** and updates dynamically:

```typescript
switch (priority) {
  case 'high':    recommendedDays = 2;  // 2 days from now
  case 'medium':  recommendedDays = 5;  // 5 days from now  
  case 'low':     recommendedDays = 10; // 10 days from now
}
```

### Priority Impact:
- **High Priority** → 2 days (urgent deadline)
- **Medium Priority** → 5 days (normal timeline)
- **Low Priority** → 10 days (flexible timeline)

### Dynamic Updates:
When you change the priority dropdown, the TaskRecommendations component should automatically:
1. Re-fetch recommendations based on new priority
2. Update the due date suggestion
3. Show new recommended date in the UI

## Usage

### For Administrators
1. **Creating Tasks**: The user selection interface shows smart recommendations with color-coded percentages
2. **Priority Selection**: Due date recommendations update automatically when priority changes
3. **Analytics Dashboard**: View system-wide task completion metrics

### For Users
1. **Task Completion**: Time is automatically calculated from creation to completion
2. **Performance Building**: Complete tasks efficiently to improve recommendation scores

## Algorithm Details

### Performance Score Calculation
```typescript
// Factors: efficiency, completion rate, performance trend
performanceScore = (avgEfficiency * 40) + (completionRate * 40) + 20
performanceScore *= trendMultiplier // 1.1 for improving, 0.9 for declining
```

### Workload Score Calculation
```typescript
workloadScore = Math.max(10, 100 - (activeTasks * 12) - (overdueTasks * 15))
```

### Task Complexity Estimation
```typescript
baseHours = 2 + contentLengthFactor + keywordComplexity + priorityMultiplier
// Used for efficiency calculation since estimatedHours was removed
```

### Final WUSS Score
```typescript
finalScore = (performance * 0.30) + (workload * 0.25) + (availability * 0.20) + 
             (skillMatch * 0.15) + (priorityHandling * 0.10)
```

## Troubleshooting

### Due Date Not Updating When Priority Changes:
1. Check that TaskRecommendations component re-renders when priority changes
2. Verify the useEffect dependency includes `taskData.priority`
3. Ensure the backend receives the correct priority value

### Low Recommendation Scores:
1. Complete more tasks to build performance history
2. Reduce active task count
3. Complete tasks efficiently (faster than complexity estimate)
4. Avoid overdue tasks

## Benefits

1. **Improved Task Assignment**: Automatically suggests the most suitable users
2. **Better Resource Allocation**: Considers workload and availability
3. **Performance Tracking**: Detailed analytics for continuous improvement
4. **Data-Driven Decisions**: Historical performance influences recommendations
5. **Clean User Experience**: Minimal UI with clear color-coded indicators

## Future Enhancements

- Machine learning integration for improved predictions
- Team collaboration scoring
- Skill-based matching with user profiles
- Calendar integration for availability
- Workload balancing algorithms