import { Container } from "typedi";
import LoggerInstance from "./logger";
import { AppDataSource } from "@datasource";

export default async function (): Promise<void> {
  try {
    Container.set("dataSource", AppDataSource);
    Container.set("logger", LoggerInstance);
  } catch (error) {
    LoggerInstance.error("Error on dependency injection: %o", error);
    throw error;
  }
}
