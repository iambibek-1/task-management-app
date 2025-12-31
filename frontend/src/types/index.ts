// Re-export all types from taskService for clean imports
export type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskRecommendation,
  TaskCompletionRecord,
  UserPerformanceAnalytics,
  TaskAnalytics,
  UserSuitabilityScore
} from '../services/taskService';

export { taskService } from '../services/taskService';