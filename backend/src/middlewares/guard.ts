import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config";
import { CustomRequestInterface, UserInterface } from "../interfaces";

export class Guard {
  public static grantAccess(
    req: CustomRequestInterface,
    res: Response,
    next: NextFunction
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: "Please provide an access token with your request headers.",
      });
    }
    const decodedToken = jwt.verify(accessToken, jwtSecret);
    if (!decodedToken) {
      return res.status(500).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }
  }
  public static grantRole(role: string) {
    return (req: CustomRequestInterface, res: Response, next: NextFunction) => {
      if (req.user.role === role) next();
      else {
        return res.status(500).json({
          success: false,
          message: "Invalid or expired access token",
        });
      }
    };
  }
}
