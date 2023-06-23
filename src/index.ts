import "module-alias/register";
import "reflect-metadata";
import "dotenv/config";

async function startServer() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await require("./loaders").default();
}

startServer();
