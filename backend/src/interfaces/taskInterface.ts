import * as Sequelize from 'sequelize';
import { StatusEnum } from '../enums';
import { PriorEnum } from '../enums';


export interface InputTaskInterface{
    title: string;
    description: string;
    status: StatusEnum;
    priority: PriorEnum;
    assignedTo?: number;
    assignedUserIds?: number[];
    dueDate?: Date;
    estimatedHours?: number;
    actualHours?: number;
    startedAt?: Date;
    completedAt?: Date;
}
export interface TaskInterface extends InputTaskInterface{
    id: number;
    assignedUsers?: any[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface TaskModelInterface extends Sequelize.Model<TaskInterface, Partial<InputTaskInterface>>,TaskInterface{}