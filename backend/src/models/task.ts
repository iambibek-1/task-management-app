import * as Sequelize from 'sequelize';
import { Database } from '../config';
import { RoleEnum } from '../enums';
import { TaskModelInterface } from '../interfaces';

const sequelize = Database.sequelize;


const Task = sequelize.define<TaskModelInterface>('Task', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("completed","inProgress", "incompleted"),
        allowNull: false,
        defaultValue: "incompleted",
      },
      priority: {
        type: Sequelize.ENUM("low", "medium", "high"),
        allowNull: false,
        defaultValue: "low",
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
      }
},{
    timestamps: false,
});
export default Task; 
