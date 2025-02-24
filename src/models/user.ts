import * as Sequelize from "sequelize";
import { Database } from "../config";
import { RoleEnum } from "../enums";
import { UserModelInterface } from "../interfaces/userInterface";

const sequelize = Database.sequelize;

const User = sequelize.define<UserModelInterface>(
  "users",
  {
    id:{
      type:Sequelize.INTEGER,
      allowNull:false,
      autoIncrement:true,
      primaryKey:true,
    },
    firstName:{
      type:Sequelize.STRING,
      allowNull:false,
    },
    lastName:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    email:{
      type:Sequelize.STRING,
      allowNull:false,
      unique:true,
    },
    password:{
      type:Sequelize.STRING,
      allowNull:false,
    },
    role:{
      type:Sequelize.ENUM(RoleEnum.admin, RoleEnum.user),
      allowNull:false,
      defaultValue: RoleEnum.user,
    }
  },
  {
    timestamps: false,
  }
);
export default User;