export function isNumber(value: string | number): boolean {
  return value != null && value !== "" && !isNaN(Number(value.toString()));
}

export function sanitizeDTO(obj: any): any {
  const keys: string[] = Object.keys(obj);
  for (const key of keys) {
    if (obj[key] === null || obj[key] === undefined || obj[key] === "") delete obj[key];
    else if (isNumber(obj[key])) obj[key] = Number(obj[key]);
    else if (typeof obj[key] === "object") obj[key] = sanitizeDTO(obj[key]);
  }
  return obj;
}
