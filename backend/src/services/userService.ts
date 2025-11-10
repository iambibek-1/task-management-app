import Models from '../models';
import { UserInterface, InputUserInterface } from '../interfaces';


export class UserService{
    public async findOne(email:string):Promise<UserInterface | null>{
        const data = await Models.User.findOne({
            where:{
                email:email,
            },
        });
        return data;
    }
    public async findAll():Promise<any>{
        const data = await Models.User.findAll();
        return data;
    }

    public async createData(data:InputUserInterface):Promise<UserInterface>{
        const result = await Models.User.create(data);
        return result;
    }

    public async updateData(id:number, data:InputUserInterface):Promise<boolean>{
        const update = await Models.User.update(data,{
            where:{
                id:id,
            }
        });
        return update [0] === 0 ? false : true;
    }

    public async deleteData(id:number):Promise <number>{
        const deleted = await Models.User.destroy({
            where:{
                id:id,
            }
        });
        return deleted;
    }
}