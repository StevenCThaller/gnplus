import { Container } from "typedi";
import LoggerInstance from "./logger";
import EDDNService from "@stream/services/eddn";
import { AppDataSource } from "@datasource";
import fs from "fs";
import path from "path";

export default async function ({ models }: any): Promise<void> {
  try {
    Container.set("dataSource", AppDataSource);
    Container.set("logger", LoggerInstance);
  } catch (error) {
    LoggerInstance.error("Error on dependency injection: %o", error);
    throw error;
  }
}
