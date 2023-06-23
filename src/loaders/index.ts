import eddnLoader from "./eddnLoader";
import typeormLoader from "./typeormLoader";
import Logger from "./logger";
import dependencyInjector from "./dependencyInjector";
import seeder from "./seeder";

export default async () => {
  try {
    await typeormLoader();
    await dependencyInjector();
    await eddnLoader();
    await seeder();
  } catch (error) {
    Logger.error("An error occurred when executing loaders: %o", error);
    process.exit(0);
  }
};
