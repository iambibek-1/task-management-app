import { Request, Response } from "express";
import { UserService } from "../../services";


export class UserController{
    public static async getUSer(req:Request, res:Response): Promise<Response>{
        const users = await new UserService().findAll();
    
        return res.status(200).json({
            success:true,
            status:200,
            message:"User get successfully",
            data:users,
        });
    }

    public static async postUser(req:Request, res:Response): Promise<Response>{
        const users = await new UserService().createData(req.body);
        return res.status(201).json({
            success:true,
            status:201,
            message:"User created successfully",
            data:users,
        });
    }
    public static async update(req: Request, res: Response): Promise<Response> {
        const id = req.params.id as unknown as number;
        const data = req.body;
    
        const update = await new UserService().updateData(id, data);
        if (update === false) {
          throw new Error(`Couldnot update directors with id${id}`);
        }
        return res.status(200).json({
          success: true,
          status: 200,
          message: "User updated successfully",
        });
      }
      public static async delete(req: Request, res: Response): Promise<Response> {
        const id = parseInt(req.params.id);
        await new UserService().deleteData(id);
    
        return res.status(200).json({
          success: true,
          status: 200,
          message: "User deleted successfully",
        });
      }
}
