import * as Sequelize from 'sequelize';
import { Database } from '../config';

const sequelize = Database.sequelize;

export interface TaskCompletionAttributes {
  id: number;
  taskId: number;
  userId: number;
  completedAt: Date;
  timeSpentHours: number;
  efficiency: number; // Ratio of estimated vs actual time
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCompletionCreationAttributes extends Omit<TaskCompletionAttributes, 'id'> {}

export interface TaskCompletionInstance
  extends Sequelize.Model<TaskCompletionAttributes, TaskCompletionCreationAttributes>,
    TaskCompletionAttributes {}

const TaskCompletion = sequelize.define<TaskCompletionInstance>(
  'TaskCompletion',
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
    completedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    timeSpentHours: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    efficiency: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 1.0,
      comment: 'Ratio of estimated vs actual time (estimated/actual)',
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'TaskCompletions',
    timestamps: true,
  }
);

export default TaskCompletion;