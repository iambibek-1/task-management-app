import Models from "../models";
import { TaskInterface, InputTaskInterface } from "../interfaces";
import { Model } from "sequelize";
import { PriorEnum } from "../enums";

export class TaskService {
  public async createTask(data: InputTaskInterface): Promise<TaskInterface> {
    const task = await Models.Task.create(data);
    return task;
  }

  public async updateTask(
    id: number,
    data: InputTaskInterface
  ): Promise<boolean> {
    const updateT = await Models.Task.update(data, {
      where: {
        id: id,
      },
    });
    return updateT[0] === 0 ? false : true;
  }

  public async deleteTask(id: number): Promise<number> {
    const deleteT = await Models.Task.destroy({
      where: {
        id: id,
      },
    });
    return deleteT;
  }

  public async findAll(): Promise<any> {
    const data = await Models.Task.findAll();
    return data;
  }

  public async getTaskByPriority(priority:PriorEnum): Promise<any> {
    try {
      const data = await Models.Task.findAll({
        where: {
          priority: priority,
        },
      });
    } catch (error) {
      console.log("Error fetching task", error);
    }
  }
}
