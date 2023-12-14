import dotenv from "dotenv";
import AWS from "aws-sdk";
import path from "path";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error) {
  throw new Error("Could not find .env file");
}

export default {
  /**
   * Assorted constant values
   */
  constants: {},

  /**
   * MySQL connection configuration data for Sequelize
   */
  sql: {
    database: process.env.SQL_DB_NAME as string,
    username: process.env.SQL_USER as string,
    password: ((): string => {
      if (process.env.DB_CONNECTION_STYLE === "rds_iam") {
        const awsConf = new AWS.Config();
        const signer = new AWS.RDS.Signer({
          region: awsConf.region,
          hostname: process.env.SQL_HOST,
          port: Number(process.env.SQL_PORT),
          username: process.env.SQL_USER
        });
        return signer.getAuthToken({});
      }
      return process.env.SQL_PASS as string;
    })(),
    host: process.env.SQL_HOST as string,
    port: Number(process.env.SQL_PORT || 0) as number,
    poolSize: Number(process.env.SQL_POOL_LIMIT || 0) as number,
    connectTimeout: Number(process.env.SQL_POOL_TIMEOUT || 0) as number,
    type: process.env.SQL_DIALECT as string,
    entities: [__dirname + "../api/models/*.{ts,js}"],
    migrations: [__dirname + "../database/migrations/*.{ts,js}"],
    supportBigNumbers: true,
    logging: false,
    synchronize: true,
    insecureAuth: process.env.NODE_ENV !== "production"
  },

  /**
   * Job scheduling info
   * @TODO - figure out cron
   */
  cron: {},

  /**
   * Winston loger configuration
   */
  logs: {
    level: process.env.LOG_LEVEL || "silly"
  },

  /**
   * EDDN Stream URL
   */
  streamUrl: "tcp://eddn.edcd.io:9500"
};
