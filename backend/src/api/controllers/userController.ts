import { Request, Response } from "express";
import { UserService } from "../../services";
import { RoleEnum } from "../../enums";


export class UserController{
    public static async getUSer(req:Request, res:Response): Promise<Response>{
        // Filter out admin users for task assignment - only return regular users
        const users = await new UserService().findAllNonAdminUsers();
    
        return res.status(200).json({
            success:true,
            status:200,
            message:"User get successfully",
            data:users,
        });
    }

    public static async getAllUsers(req:Request, res:Response): Promise<Response>{
        console.log('🔍 getAllUsers method called');
        console.log('User from request:', (req as any).user);
        
        try {
            // Return all users including admins for user management
            const users = await new UserService().findAll();
            
            console.log(`✅ Found ${users.length} users`);
        
            return res.status(200).json({
                success:true,
                status:200,
                message:"All users retrieved successfully",
                data:users,
            });
        } catch (error) {
            console.error('❌ Error in getAllUsers:', error);
            return res.status(500).json({
                success: false,
                status: 500,
                message: "Error retrieving users",
                error: (error as Error).message
            });
        }
    }

    public static async postUser(req:Request, res:Response): Promise<Response>{
        const userData = req.body;
        
        // Prevent admin user creation through this endpoint
        if (userData.role && userData.role === 'admin') {
            return res.status(403).json({
                success: false,
                status: 403,
                message: "Admin accounts cannot be created through this endpoint",
            });
        }
        
        // Force role to be 'user' for this endpoint
        const userDataWithRole = {
            ...userData,
            role: RoleEnum.user
        };
        
        const users = await new UserService().createData(userDataWithRole);
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
