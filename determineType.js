const fs = require("fs");
const path = require("path");
const DOCKED_DIR = path.join(__dirname, "eventData", "docked");
const SCAN_EVENT_DIR = path.join(__dirname, "eventData", "scan");
const FSDJUMP_EVENT_DIR = path.join(__dirname, "eventData", "fsdjump");

const OUTPUT_DIR = path.join(__dirname, "determinedTypes");

const isString = (value) => typeof value === "string";
const isNumber = (value) => typeof value === "number";
const isNumeric = (value) =>
  isNumber(value) || typeof Number(value) === "number";
const isBoolean = (value) => typeof value === "boolean";
const isObject = (value) => typeof value === "object";
const isArray = (value) => Array.isArray(value);
const isEvery = (value, isFn) => value.every((subValue) => isFn(subValue));
const isStringArray = (value) => isArray(value) && isEvery(value, isString);
const isNumberArray = (value) => isArray(value) && isEvery(value, isNumber);
const isNumericArray = (value) => isArray(value) && isEvery(value, isNumeric);
const isPrimitiveArray = (value) =>
  value.every((subValue) => typeof subValue !== "object");
const isBooleanArray = (value) => isArray(value) && isEvery(value, isBoolean);
const isObjectArray = (value) => isArray(value) && isEvery(value, isObject);

function createTypeOutline(eventName, dataDirectory) {
  const files = fs.readdirSync(dataDirectory);

  const typeOutline = {};

  const bodyTypeSet = new Set();
  const economySet = new Set();

  for (const file of files) {
    const eventData = JSON.parse(fs.readFileSync(`${dataDirectory}/${file}`));
    // console.log(eventData);
    bodyTypeSet.add(eventData.BodyType);
    if (eventData.SystemEconomy) economySet.add(eventData.SystemEconomy);

    // generateType(eventData, typeOutline);
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${eventName}.json`),
    JSON.stringify(typeOutline)
  );
}

function generateType(data, typeDictionary) {
  const properties = Object.keys(data);

  for (const property of properties) {
    const propertyType = determinePropertyType(data[property]);

    // const property_is_array = isArray(data[property]);
    // const property_is_complex_array =
    //   property_is_array && isObjectArray(data[property]);
    // const property_is_primitive_array =
    //   property_is_array && isPrimitiveArray(data[property]);
    const property_is_object = isObject(data[property]);

    if (property_is_object) {
      handleNestedObjectTypes(data, property, typeDictionary);
    } else {
      typeDictionary[property] = propertyType;
    }
  }

  return typeDictionary;
}

function handleNestedObjectTypes(data, property, typeDictionary) {
  const property_not_logged = !typeDictionary.hasOwnProperty(property);
  const property_was_primitive = !isObject(typeDictionary[property]);
  const property_is_complex = !property_not_logged && !property_was_primitive;
  const property_can_vary =
    property_is_complex && isArray(typeDictionary[property].typeName);
  const varying_property_type_already_included =
    property_can_vary &&
    typeDictionary[property].some(
      (prop) => prop === determinePropertyType(data[property])
    );
  if (property_not_logged) {
    typeDictionary[property] = {
      typeName: property,
      typeDef: {}
    };
  } else if (property_was_primitive) {
    typeDictionary[property] = {
      typeName: [typeDictionary[property]]
    };
  } else if (varying_property_type_already_included) {
    return typeDictionary[property];
  }
  generateType(data[property], typeDictionary[property].typeDef);
}

function determinePropertyType(value) {
  if (isString(value)) return "string";
  if (isNumber(value)) return "number";
  if (isBoolean(value)) return "boolean";
  if (isArray(value)) {
    if (isStringArray(value)) return "string[]";
    if (isNumberArray(value)) return "number[]";
    if (isBooleanArray(value)) return "boolean[]";
    if (isObjectArray(value)) return "object[]";
  }
  if (isObject(value)) return "object";
}

createTypeOutline("fsdjump", FSDJUMP_EVENT_DIR);
