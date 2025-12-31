import Task from "./task";
import User from "./user";
import TaskAssignment from "./taskAssignment";
import TaskCompletion from "./taskCompletion";

// Define associations
Task.belongsToMany(User, { 
  through: TaskAssignment, 
  foreignKey: 'taskId',
  as: 'assignedUsers'
});

User.belongsToMany(Task, { 
  through: TaskAssignment, 
  foreignKey: 'userId',
  as: 'assignedTasks'
});

// TaskCompletion associations
TaskCompletion.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
TaskCompletion.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Task.hasMany(TaskCompletion, { foreignKey: 'taskId', as: 'completions' });
User.hasMany(TaskCompletion, { foreignKey: 'userId', as: 'completions' });

const Models = {
    User,
    Task,
    TaskAssignment,
    TaskCompletion,
}
export default Models;