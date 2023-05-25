import eddnLoader from "./eddnLoader";
import typeormLoader from "./typeormLoader";
import Logger from "./logger";
import dependencyInjector from "./dependencyInjector";
import fs from "fs";
import path from "path";

export default async () => {
  try {
    await typeormLoader();

    const baseName: string = path.basename(__filename);

    await dependencyInjector({ models: [], services: [] });
    await eddnLoader();
  } catch (error) {
    Logger.error("An error occurred when executing loaders: %o", error);
    process.exit(0);
  }
};
