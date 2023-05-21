export const hasOwnProperty = (obj: any, property: string): boolean => {
  if (typeof obj === "object")
    return Object.prototype.hasOwnProperty.call(obj, property);

  return false;
};
