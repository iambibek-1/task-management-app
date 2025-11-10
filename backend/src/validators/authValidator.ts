import Joi from 'joi';
import { RoleEnum } from '../enums';

export const signupValidator= Joi.object({
    firstName:Joi.string().required(),
    lastName:Joi.string().required(),
    email:Joi.string().email().required(),
    password:Joi.string().required(),
    role:Joi.string().valid(RoleEnum.admin,RoleEnum.user).optional().default(RoleEnum.user)
});

export const loginValidator= Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().required()
})