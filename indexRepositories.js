const fs = require("fs");
const path = require("path");

const INDEX_FILENAME = "index.ts";
const REPOSITORY_DIRECTORY = path.join(__dirname, "src", "api", "repositories");
const INDEX_PATH = path.join(REPOSITORY_DIRECTORY, INDEX_FILENAME);

const repositoryIndexContents = fs
  .readdirSync(REPOSITORY_DIRECTORY)
  .filter(
    (fileName) =>
      fileName.includes(".repository.ts") && fileName !== INDEX_FILENAME
  )
  .reduce((contents, fileName) => {
    let repositoryName = fileName.replace(".repository.ts", "");
    repositoryName =
      repositoryName[0].toUpperCase() + repositoryName.slice(1) + "Repository";

    fileName = fileName.replace(".ts", "");

    const newLine = `export { default as ${repositoryName} } from "./${fileName}";
`;
    return contents + newLine;
  }, "");

fs.writeFileSync(INDEX_PATH, repositoryIndexContents);
