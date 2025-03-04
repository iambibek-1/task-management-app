import {Router} from "express";

import { exceptionHandler, Validator } from "../../middlewares";
import { loginValidator, signupValidator } from "../../validators";
import { AuthController } from "../controllers";

const authRoutes = Router();

authRoutes.post('/signup',exceptionHandler(Validator.check(signupValidator)),
exceptionHandler(AuthController.signup)
);

authRoutes.post('/login',exceptionHandler(Validator.check(loginValidator)),
exceptionHandler(AuthController.login)
);

export default authRoutes;
