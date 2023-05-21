import { DataSource } from "typeorm";
import config from "./config";
const sqlOptions = config.sql;

export const AppDataSource = new DataSource({
  type: "mysql",
  host: sqlOptions.host,
  port: sqlOptions.port,
  username: sqlOptions.username,
  password: sqlOptions.password,
  database: sqlOptions.database,
  entities: ["build/api/models/*.{js,ts}"],
  migrations: ["build/database/migrations/*.{js,ts}"],
  subscribers: [],
  synchronize: false
});
