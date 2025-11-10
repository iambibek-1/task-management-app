import Task from "./task";
import User from "./user";
import TaskAssignment from "./taskAssignment";

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

const Models = {
    User,
    Task,
    TaskAssignment,
}
export default Models;