import { error } from "console";
import { NextFunction,Request,Response } from "express";

export const exceptionHandler = 
(fn:Function)=> (req:Request, res:Response, next:NextFunction)=>
    Promise.resolve(fn(req,res,next)).catch((error)=>next(error));