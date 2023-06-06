export default function toPascalCase(stringToConvert: string): string {
  let returnString = stringToConvert[0].match(/[0-9]/) ? "_" : "";
  for (let i = 0; i < stringToConvert.length; i++) {
    if (i === 0) {
      if (stringToConvert[0] !== "_") {
        returnString += stringToConvert[i].toLowerCase();
      }
    } else if (stringToConvert[i - 1] === " " || stringToConvert[i - 1] === "_") {
      if (stringToConvert[i].match(/[a-zA-Z]/)) {
        returnString += stringToConvert[i].toUpperCase();
      } else if (stringToConvert[i].match(/[0-9]/)) {
        returnString += stringToConvert[i];
      }
    } else if (stringToConvert[i - 1].match(/[0-9]/)) {
      returnString += stringToConvert[i].toUpperCase();
    } else if (stringToConvert[i].match(/[0-9a-zA-Z]/)) {
      returnString += stringToConvert[i];
    }
  }

  return returnString;
}

const expected1 = "helloMoto";
const actual1 = toPascalCase("HelloMoto");
console.assert(actual1 === expected1, `Expected: "helloMoto" | Actual: "${actual1}"`);

const expected2 = "_2ToeNails";
const actual2 = toPascalCase("2toeNails");
console.assert(actual2 === expected2, `Expected "_2ToeNails" | Actual: "${actual2}"`);
