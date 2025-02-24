import { Dialect, Sequelize } from "sequelize";

import { db } from '.';

class Database {
  private static instance: Database;
  public sequelize: Sequelize;
  private host: string;
  private username: string;
  private password: string;
  private name: string;
  private port: number;
  private dialect: string;

  public constructor() {
    this.host = db.host;
    this.username = db.username;
    this.password = db.password;
    this.name = db.name;
    this.port = Number(db.port);
    this.dialect = db.dialect;

    this.sequelize = new Sequelize(this.name, this.username, this.password, {
      host: this.host,
      dialect: this.dialect as Dialect,
      port: this.port,
    });
  }
  static get(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }



  public async connection() {
    try {
      await this.sequelize.authenticate();
      console.info(`${this.dialect}database connected`);
      return this.sequelize;
    } catch (error: any) {
      console.error(error.message);
      return error;
    }
  }
}
const database = Database.get();

export {database as Database};
