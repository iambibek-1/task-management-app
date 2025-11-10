import dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT;
export const environment = process.env.ENVIRONMENT;
export const db={
    host:process.env.DB_HOST,
    username:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    name:process.env.DB_NAME,
    port:process.env.DB_PORT,
    dialect:process.env.DB_DIALECT || 'mysql',

}as{
    host:string;
    username:string;
    password:string;
    name:string;
    port:string;
    dialect:string;
};
export const jwtSecret = process.env.JWT_SECRET_KEY as string;

export * from './dbInstance';