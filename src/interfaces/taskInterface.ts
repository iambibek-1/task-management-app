import * as Sequelize from 'sequelize';
import { StatusEnum } from '../enums';
import { PriorEnum } from '../enums';


export interface InputTaskInterface{
    title:string;
    description:string;
    status:StatusEnum;
    priority:PriorEnum;
}
export interface TaskInterface extends InputTaskInterface{
    id: number;
}
export interface TaskModelInterface extends Sequelize.Model<TaskInterface, Partial<InputTaskInterface>>,TaskInterface{}