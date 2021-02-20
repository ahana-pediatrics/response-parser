export const getKeys = <T extends object>(o: T): Array<keyof T> => {
  return Object.keys(o) as Array<keyof T>;
};
