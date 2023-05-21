import { DataSource, DataSourceOptions } from "typeorm";
import config from "@config/index";
import Logger from "./logger";
import { AppDataSource } from "@datasource";

export default async function (): Promise<DataSource> {
  try {
    let ret = await AppDataSource.initialize();
    Logger.info("TypeORM successfully connected.");

    return ret;
  } catch (error) {
    Logger.error("Error on TypeORM initialization: %o", error);
    throw error;
  }
}

// {
//   type: "mysql",
//   host: sqlOptions.host,
//   port: sqlOptions.port,
//   username: sqlOptions.user,
//   password: sqlOptions.,
//   database: DB_BASE,
//   entities: ["src/api/models/*.js"],
//   logging: true,
//   synchronize: true
// }
