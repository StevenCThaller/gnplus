const fs = require("fs");
const path = require("path");

const INDEX_FILENAME = "index.ts";
const MODELS_DIRECTORY = path.join(__dirname, "src", "api", "models");
const INDEX_PATH = path.join(MODELS_DIRECTORY, INDEX_FILENAME);

const modelIndexContents = fs
  .readdirSync(MODELS_DIRECTORY)
  .filter(
    (fileName) => fileName.includes(".model.ts") && fileName !== INDEX_FILENAME
  )
  .reduce((contents, fileName) => {
    let modelName = fileName.replace(".model.ts", "");
    modelName = modelName[0].toUpperCase() + modelName.slice(1);

    fileName = fileName.replace(".ts", "");

    const newLine = `export { default as ${modelName} } from "./${fileName}";
    `;
    return contents + newLine;
  }, "");
