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
    const serviceFiles = fs
      .readdirSync(path.join(__dirname, "../api/services"))
      .filter(
        (fileName: string) =>
          fileName.slice(-4) !== ".map" && fileName !== baseName
      )
      .map((fileName: string) =>
        fileName.replace(".ts", "").replace(".js", "")
      );

    await dependencyInjector({ models: [], services: serviceFiles });
    await eddnLoader();
  } catch (error) {
    Logger.error("An error occurred when executing loaders: %o", error);
    process.exit(0);
  }
};
