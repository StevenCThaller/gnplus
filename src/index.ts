import "module-alias/register";
import "reflect-metadata";
import "dotenv/config";

async function startServer() {
  await require("./loaders").default();
}

startServer();
