import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config";
import { CustomRequestInterface, UserInterface } from "../interfaces";
import { RoleEnum } from "../enums";

export class Guard {
  public static authenticate(
    req: CustomRequestInterface,
    res: Response,
    next: NextFunction
  ): void {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      res.status(401).json({
        success: false,
        message: "Please provide an access token with your request headers.",
      });
      return;
    }
    
    try {
      const decodedToken = jwt.verify(accessToken, jwtSecret) as any;
      if (!decodedToken) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired access token",
        });
        return;
      }
      
      // Attach user info to request
      req.user = {
        id: decodedToken.id,
        email: decodedToken.email,
        role: decodedToken.role,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
      } as UserInterface;
      
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
      return;
    }
  }
  
  public static requireAdmin(
    req: CustomRequestInterface,
    res: Response,
    next: NextFunction
  ): void {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }
    
    if (req.user.role !== RoleEnum.admin) {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
      return;
    }
    
    next();
  }
  
  public static grantAccess = Guard.authenticate;
  
  public static grantRole(role: string) {
    return (req: CustomRequestInterface, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }
      
      if (req.user.role === role) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
        return;
      }
    };
  }
}
