import { NextFunction, Request, Response } from "express";
import {ArraySchema, ObjectSchema} from "joi";


export class Validator{
    private constructor(){}


    public static check = (schema:ObjectSchema | ArraySchema)=>{
        return (req:Request , res:Response, next:NextFunction)=>{
            const {value , error} = schema.validate(req.body,{
                abortEarly:false,
            });
            if (error) throw error;
            next();
        };
    };
}
