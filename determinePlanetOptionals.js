const fs = require("fs");
const path = require("path");

const OTHER_TYPE_FILE = path.join(__dirname, "determinedTypes", "other.json");
const SCAN_EVENT_DIR = path.join(__dirname, "eventData", "scan");

function determineOptionals(allTypeObj, data) {
  const breakdown = {
    required: allTypeObj,
    optionals: {}
  };

  data.forEach((obj) => {
    if (!obj.hasOwnProperty("PlanetClass") && !obj.hasOwnProperty("StarType"))
      return;
    const requiredProps = Object.keys(breakdown.required);

    requiredProps.forEach((prop) => {
      if (
        !obj.hasOwnProperty(prop) &&
        !breakdown.optionals.hasOwnProperty(prop)
      ) {
        breakdown.optionals[prop] = breakdown.required[prop];
        delete breakdown.required[prop];
      }
    });
  });
  console.log(breakdown);
}

function getAllData(directoryPath) {
  return fs
    .readdirSync(directoryPath)
    .map((file) => JSON.parse(fs.readFileSync(`${directoryPath}/${file}`)));
}

function getTypeData(filePath) {
  const data = fs.readFileSync(filePath).toString();

  return JSON.parse(data);
}

const allData = getAllData(SCAN_EVENT_DIR);
const typeData = getTypeData(OTHER_TYPE_FILE);

determineOptionals(typeData, allData);

// fs.readdirSync(FSDJUMP_EVENT_DIR).forEach((file) => {
//   const data = JSON.parse(
//     fs.readFileSync(`${FSDJUMP_EVENT_DIR}/${file}`).toString()
//   );
// });
