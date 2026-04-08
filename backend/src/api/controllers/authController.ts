import { Request, Response } from "express";
import { UserService } from "../../services";
import { jwtSecret } from "../../config";
import { RoleEnum } from "../../enums";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class AuthController {
  public static async signup(req: Request, res: Response): Promise<Response> {
    const UserData = req.body;

    // Prevent admin signup through public registration
    if (UserData.role && UserData.role === 'admin') {
      return res.status(403).json({
        message: "Admin accounts cannot be created through public signup",
        success: false,
      });
    }

    const userExist = await new UserService().findOne(UserData.email);
    if (userExist) {
      return res.status(500).json({
        message: `User with email: ${UserData.email} already exists!!`,
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(UserData.password, 10);

    const user = await new UserService().createData({
      firstName: UserData.firstName,
      lastName: UserData.lastName,
      email: UserData.email,
      password: hashedPassword,
      role: RoleEnum.user, // Force role to be 'user' for public signup
    });
    
    // Generate token for auto-login after signup
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );
    
    return res.status(200).json({
      message: "Signup successful",
      success: true,
      token: accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  }

  public static async login(req: Request, res: Response): Promise<Response> {
    const loginUser = req.body;
    const loginExist = await new UserService().findOne(loginUser.email);

    if (!loginExist) {
      return res.status(500).json({
        message: `User with email: ${loginUser.email} does not exist!!`,
        success: false,
      });
    }

    const doesPaswordMatch = await bcrypt.compare(
      loginUser.password,
      loginExist.password
    );

    if (!doesPaswordMatch) {
      return res.status(500).json({
        message: "Invalid Password",
        success: false,
      });
    }
    const accessToken = jwt.sign(
      {
        id: loginExist.id,
        email: loginExist.email,
        role: loginExist.role,
        firstName: loginExist.firstName,
        lastName: loginExist.lastName,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );
    return res.status(200).json({
      message: "Login successful",
      success: true,
      token: accessToken,
      user: {
        id: loginExist.id,
        firstName: loginExist.firstName,
        lastName: loginExist.lastName,
        email: loginExist.email,
        role: loginExist.role,
      },
    });
  }
}
