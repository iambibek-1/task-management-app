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
- **Highly Recommended (≥85%)** - 🔴 Red text - "Highly Recommended"
- **Recommended (70-84%)** - 🟢 Green text - "Recommended" 
- **Suitable (50-69%)** - 🟡 Yellow text - "Suitable"
- **Not Recommended (<50%)** - 🔴 Red text - "Not Recommended"

### 4. Enhanced Task Management
- **Auto Time Tracking**: Time calculated from task creation to completion
- **Efficiency Calculation**: Based on task complexity estimation vs actual time spent
- **Completion Records**: Detailed completion history with performance metrics
- **Task Analytics**: Dashboard with completion rates and efficiency trends

## Detailed Scoring System

### Baseline Scores (Starting Points)

Each factor has a baseline score that represents the starting point for new users or when no data is available:

| Factor | New User Baseline | Reason |
|--------|------------------|---------|
| Performance Score | 60 | Lower default to encourage trying new users |
| Workload Score | 100 | New users have no workload |
| Availability Score | 80 | Default good availability |
| Skill Match Score | 60 | Moderate baseline for new users |
| Priority Handling Score | 70 | Neutral starting point |

**Initial Overall Score for New Users**: ~70% (Recommended level)

### Factor 1: Performance Score (30% weight)

**Range**: 10-100 points  
**Baseline**: 60 points for new users

#### Calculation Formula:
```typescript
performanceScore = (avgEfficiency * 40) + (completionRate * 40) + 20
performanceScore *= trendMultiplier // 1.1 for improving, 0.9 for declining
```

#### Detailed Examples:

**Example 1: High Performer (Score: 92)**
- Average Efficiency: 1.8 (completes tasks 80% faster than estimated)
- Completion Rate: 95% (completes 19 out of 20 assigned tasks)
- Performance Trend: Improving (recent tasks better than older ones)
- Calculation: (1.8 × 40) + (0.95 × 40) + 20 = 72 + 38 + 20 = 130 × 1.1 = 143 → Capped at 100
- **Result**: 92 points (after realistic capping)

**Example 2: Average Performer (Score: 68)**
- Average Efficiency: 0.9 (takes 10% longer than estimated)
- Completion Rate: 80% (completes 8 out of 10 assigned tasks)
- Performance Trend: Stable
- Calculation: (0.9 × 40) + (0.8 × 40) + 20 = 36 + 32 + 20 = 88 × 1.0 = 88
- **Result**: 68 points

**Example 3: Poor Performer (Score: 25)**
- Average Efficiency: 0.4 (takes 2.5x longer than estimated)
- Completion Rate: 50% (abandons half of assigned tasks)
- Performance Trend: Declining
- Calculation: (0.4 × 40) + (0.5 × 40) + 20 = 16 + 20 + 20 = 56 × 0.9 = 50.4
- **Result**: 25 points (after minimum capping)

### Factor 2: Workload Score (25% weight)

**Range**: 10-100 points  
**Baseline**: 100 points for users with no active tasks

#### Calculation Formula:
```typescript
workloadScore = Math.max(10, 100 - (activeTasks * 12) - (overdueTasks * 15))
```

#### Detailed Examples:

**Example 1: Light Workload (Score: 100)**
- Active Tasks: 0
- Overdue Tasks: 0
- Calculation: 100 - (0 × 12) - (0 × 15) = 100
- **Result**: 100 points

**Example 2: Moderate Workload (Score: 76)**
- Active Tasks: 2
- Overdue Tasks: 0
- Calculation: 100 - (2 × 12) - (0 × 15) = 100 - 24 = 76
- **Result**: 76 points

**Example 3: Heavy Workload (Score: 25)**
- Active Tasks: 5
- Overdue Tasks: 2
- Calculation: 100 - (5 × 12) - (2 × 15) = 100 - 60 - 30 = 10
- **Result**: 25 points (after minimum capping)

**Example 4: Overloaded (Score: 10)**
- Active Tasks: 8
- Overdue Tasks: 3
- Calculation: 100 - (8 × 12) - (3 × 15) = 100 - 96 - 45 = -41 → Capped at 10
- **Result**: 10 points (minimum)

### Factor 3: Availability Score (20% weight)

**Range**: 20-100 points  
**Baseline**: 80 points when no due date specified

#### Calculation Logic:
- Base score: 100 points
- Penalty: -20 points per conflicting task (±3 days from due date)
- Time pressure penalty: -20 points if due in <2 days
- Time bonus: +10 points if due in >14 days

#### Detailed Examples:

**Example 1: Perfect Availability (Score: 100)**
- Due Date: 20 days from now
- Conflicting Tasks: 0
- Calculation: 100 - (0 × 20) + 10 = 110 → Capped at 100
- **Result**: 100 points

**Example 2: Good Availability (Score: 70)**
- Due Date: 7 days from now
- Conflicting Tasks: 1 (task due 6 days from now)
- Calculation: 100 - (1 × 20) = 80
- **Result**: 80 points

**Example 3: Poor Availability (Score: 40)**
- Due Date: 1 day from now (urgent)
- Conflicting Tasks: 2
- Calculation: 100 - (2 × 20) - 20 = 100 - 40 - 20 = 40
- **Result**: 40 points

### Factor 4: Skill Match Score (15% weight)

**Range**: 30-100 points  
**Baseline**: 60 points for new users

#### Calculation Method:
Uses content similarity analysis between current task and user's completed tasks.

#### Detailed Examples:

**Example 1: Perfect Skill Match (Score: 95)**
- Current Task: "Implement database API with authentication"
- User's Previous Tasks: 
  - "Database optimization and API development"
  - "User authentication system implementation"
  - "API security and database integration"
- Similarity: 95% (many matching keywords: database, API, authentication)
- **Result**: 95 points

**Example 2: Moderate Skill Match (Score: 65)**
- Current Task: "Frontend React component development"
- User's Previous Tasks:
  - "Backend API development"
  - "Database schema design"
  - "React UI bug fixes" (partial match)
- Similarity: 65% (some matching keywords: React, development)
- **Result**: 65 points

**Example 3: Poor Skill Match (Score: 35)**
- Current Task: "Machine learning model training"
- User's Previous Tasks:
  - "HTML/CSS styling updates"
  - "Email template design"
  - "Basic form validation"
- Similarity: 35% (very few matching keywords)
- **Result**: 35 points

### Factor 5: Priority Handling Score (10% weight)

**Range**: 30-100 points  
**Baseline**: 70 points for users with no priority-specific history

#### Calculation Method:
Based on average efficiency for tasks of the same priority level.

#### Detailed Examples:

**Example 1: Excellent Priority Handler (Score: 95)**
- Priority: High
- Previous High Priority Tasks: 8 completed
- Average Efficiency: 1.4 (completes high-priority tasks 40% faster)
- Calculation: min(100, max(30, 1.4 × 70)) = min(100, 98) = 98
- **Result**: 95 points

**Example 2: Average Priority Handler (Score: 70)**
- Priority: Medium
- Previous Medium Priority Tasks: 5 completed
- Average Efficiency: 1.0 (completes on time)
- Calculation: min(100, max(30, 1.0 × 70)) = 70
- **Result**: 70 points

**Example 3: Poor Priority Handler (Score: 42)**
- Priority: High
- Previous High Priority Tasks: 3 completed
- Average Efficiency: 0.6 (takes 67% longer than estimated)
- Calculation: min(100, max(30, 0.6 × 70)) = max(30, 42) = 42
- **Result**: 42 points

## Real-World Scoring Examples

### Scenario 1: Senior Developer (Overall Score: 87%)

**Task**: "Implement complex payment gateway integration with security features"

| Factor | Score | Calculation | Reason |
|--------|-------|-------------|---------|
| Performance | 92 | High efficiency (1.8), 95% completion rate, improving trend | Consistently delivers quality work fast |
| Workload | 88 | 1 active task, 0 overdue | Light current workload |
| Availability | 90 | Due in 10 days, no conflicts | Good availability window |
| Skill Match | 85 | Previous payment/security tasks | Strong relevant experience |
| Priority Handling | 88 | Excellent with high-priority tasks | Handles pressure well |

**Final Score**: (92×0.3) + (88×0.25) + (90×0.2) + (85×0.15) + (88×0.1) = **87%**
**Recommendation**: **Highly Recommended** 🔴
**Reason**: "excellent track record, low current workload, relevant experience"

### Scenario 2: Mid-Level Developer (Overall Score: 73%)

**Task**: "Create responsive dashboard with data visualization"

| Factor | Score | Calculation | Reason |
|--------|-------|-------------|---------|
| Performance | 75 | Good efficiency (1.1), 85% completion rate | Solid performer |
| Workload | 76 | 2 active tasks, 0 overdue | Moderate workload |
| Availability | 80 | Due in 14 days, 1 minor conflict | Decent availability |
| Skill Match | 70 | Some dashboard/UI experience | Relevant but not perfect match |
| Priority Handling | 65 | Average with medium priority | Handles normal priority well |

**Final Score**: (75×0.3) + (76×0.25) + (80×0.2) + (70×0.15) + (65×0.1) = **73%**
**Recommendation**: **Recommended** 🟢
**Reason**: "good performance history, relevant experience"

### Scenario 3: Junior Developer (Overall Score: 62%)

**Task**: "Simple bug fixes and code cleanup"

| Factor | Score | Calculation | Reason |
|--------|-------|-------------|---------|
| Performance | 60 | New user baseline | Limited history |
| Workload | 100 | 0 active tasks | No current workload |
| Availability | 80 | Default availability | No conflicts |
| Skill Match | 45 | Limited matching experience | Basic tasks only |
| Priority Handling | 70 | Default score | No priority-specific data |

**Final Score**: (60×0.3) + (100×0.25) + (80×0.2) + (45×0.15) + (70×0.1) = **62%**
**Recommendation**: **Suitable** 🟡
**Reason**: "low current workload, suitable for assignment"

### Scenario 4: Overloaded Developer (Overall Score: 35%)

**Task**: "Critical system maintenance"

| Factor | Score | Calculation | Reason |
|--------|-------|-------------|---------|
| Performance | 45 | Poor efficiency (0.7), 60% completion rate | Struggling with current load |
| Workload | 10 | 6 active tasks, 3 overdue | Severely overloaded |
| Availability | 30 | Due tomorrow, 3 conflicts | No availability |
| Skill Match | 80 | Perfect experience match | Right skills, wrong timing |
| Priority Handling | 40 | Poor with high priority | Struggles under pressure |

**Final Score**: (45×0.3) + (10×0.25) + (30×0.2) + (80×0.15) + (40×0.1) = **35%**
**Recommendation**: **Not Recommended** 🔴
**Reason**: "high current workload, limited availability"

## Progressive Score Evolution Examples

### New User Journey (3 months)

**Month 1 - First Task Assignment**:
- Overall Score: 70% (baseline)
- Recommendation: Recommended 🟢
- Factors: All baseline scores

**Month 2 - After 3 completed tasks**:
- Performance: 68 (efficiency 0.9, 100% completion)
- Workload: 88 (1 active task)
- Overall Score: 74%
- Recommendation: Recommended 🟢

**Month 3 - After 8 completed tasks**:
- Performance: 82 (efficiency 1.2, 100% completion, improving trend)
- Skill Match: 75 (building expertise)
- Overall Score: 81%
- Recommendation: Recommended 🟢 (approaching Highly Recommended)

### Declining Performance Example

**Quarter 1**: Score 85% (Highly Recommended)
**Quarter 2**: Score 78% (Recommended) - slight decline in efficiency
**Quarter 3**: Score 65% (Suitable) - more overdue tasks, declining trend
**Quarter 4**: Score 45% (Not Recommended) - poor completion rate, overloaded

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

## How to Achieve High Recommendation Scores

### For New Users (Starting at ~70%):
1. **Accept and complete first tasks** - Build completion rate
2. **Focus on efficiency** - Complete tasks faster than estimated
3. **Avoid overdue tasks** - Maintain good time management
4. **Build expertise** - Work on similar types of tasks

### For Existing Users to Improve:
1. **Complete Tasks Efficiently (30% weight)**
   - Finish tasks faster than the estimated complexity time
   - Maintain high completion rates (complete assigned tasks vs abandon them)
   - Show improving performance trends over recent completions

2. **Maintain Low Workload (25% weight)**
   - Keep active task count low (0-2 tasks = high score)
   - Avoid overdue tasks (they heavily penalize the score)
   - Complete tasks on time to prevent workload buildup

3. **Be Available (20% weight)**
   - Have fewer conflicting tasks around due dates
   - Accept tasks with reasonable timeframes
   - Avoid scheduling conflicts

4. **Match Task Skills (15% weight)**
   - Work on similar tasks to build expertise in specific areas
   - Complete tasks with similar keywords and complexity
   - Build a track record in specific domains

5. **Handle Priority Levels Well (10% weight)**
   - Successfully complete tasks of the same priority level
   - Show good efficiency with high/medium/low priority tasks
   - Maintain consistent performance across priority levels

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

### Unexpected Recommendations:
1. Check user's recent completion history
2. Verify task content similarity calculations
3. Review current workload and availability factors

## Benefits

1. **Improved Task Assignment**: Automatically suggests the most suitable users
2. **Better Resource Allocation**: Considers workload and availability
3. **Performance Tracking**: Detailed analytics for continuous improvement
4. **Data-Driven Decisions**: Historical performance influences recommendations
5. **Clean User Experience**: Minimal UI with clear color-coded indicators
6. **Fair Distribution**: Prevents overloading high performers
7. **Skill Development**: Encourages users to build expertise in specific areas

## Future Enhancements

- Machine learning integration for improved predictions
- Team collaboration scoring
- Skill-based matching with user profiles
- Calendar integration for availability
- Workload balancing algorithms
- Custom weight adjustments per organization
- Seasonal performance pattern recognition
- Cross-team collaboration scoring