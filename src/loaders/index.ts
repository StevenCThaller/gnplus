import eddnLoader from "./eddnLoader";
import typeormLoader from "./typeormLoader";
import Logger from "./logger";
import dependencyInjector from "./dependencyInjector";
import fs from "fs";
import expressLoader from "./express";
import path from "path";
import seeder from "./seeder";

export default async () => {
  try {
    await typeormLoader();

    const baseName: string = path.basename(__filename);

    await dependencyInjector({ models: [], services: [] });
    await eddnLoader();
    await seeder();
    await expressLoader();
  } catch (error) {
    Logger.error("An error occurred when executing loaders: %o", error);
    process.exit(0);
  }
};
