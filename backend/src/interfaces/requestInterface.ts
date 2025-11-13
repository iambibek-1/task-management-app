import { Request } from "express";
import { UserInterface } from "./userInterface";

export interface CustomRequestInterface extends Request{
    user?: UserInterface
}