import * as Sequelize from 'sequelize';
import { Database } from '../config';

const sequelize = Database.sequelize;

export interface TaskAssignmentAttributes {
  id: number;
  taskId: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskAssignmentCreationAttributes extends Omit<TaskAssignmentAttributes, 'id'> {}

export interface TaskAssignmentInstance
  extends Sequelize.Model<TaskAssignmentAttributes, TaskAssignmentCreationAttributes>,
    TaskAssignmentAttributes {}

const TaskAssignment = sequelize.define<TaskAssignmentInstance>(
  'TaskAssignment',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    taskId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Tasks',
        key: 'id',
      },
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'TaskAssignments',
    timestamps: true,
  }
);

export default TaskAssignment;
