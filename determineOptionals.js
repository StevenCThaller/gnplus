const fs = require("fs");
const path = require("path");

const DOCKED_TYPE_FILE = path.join(__dirname, "determinedTypes", "docked.json");
const DOCKED_EVENT_DIR = path.join(__dirname, "eventData", "docked");

const SCAN_TYPE_FILE = path.join(__dirname, "determinedTypes", "scan.json");
const SCAN_EVENT_DIR = path.join(__dirname, "eventData", "scan");

const FSDJUMP_TYPE_FILE = path.join(
  __dirname,
  "determinedTypes",
  "fsdjump.json"
);
const FSDJUMP_EVENT_DIR = path.join(__dirname, "eventData", "fsdjump");

function determineOptionals(allTypeObj, data) {
  const breakdown = {
    required: allTypeObj,
    optionals: {}
  };

  data.forEach((obj) => {
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

const allData = getAllData(FSDJUMP_EVENT_DIR);
const typeData = getTypeData(FSDJUMP_TYPE_FILE);

determineOptionals(typeData, allData);

// fs.readdirSync(DOCKED_EVENT_DIR).forEach((file) => {
//   const data = JSON.parse(
//     fs.readFileSync(`${DOCKED_EVENT_DIR}/${file}`).toString()
//   );
//   if (!data.hasOwnProperty("LandingPads")) {
//     console.log("NO LANDING PAD ON DOCKED", file);
//   }
//   // if(!data.hasOwnproperty())
//   if (!data.hasOwnProperty("StationEconomy")) {
//     console.log("NO ECONOMY ON DOCKED", file);
//     // const matchingStation = allData.find(
//     //   (station) =>
//     //     station.MarketID === data.MarketID &&
//     //     station.timestamp !== data.timestamp
//     // );

//     // if (matchingStation) {
//     //   console.log("FOUND MATCHING STATION:", matchingStation);
//     // } else {
//     //   console.log("No other data to compare");
//     // }
//   }
// });
