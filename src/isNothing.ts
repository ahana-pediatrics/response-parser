export type Nothing = undefined | null;

export const isNothing = <T>(val: T | Nothing): val is Nothing =>
  val === null || typeof val === "undefined";

export const isEmpty = (
  val: string | number | unknown[] | unknown
): boolean => {
  if (isNothing(val)) {
    return true;
  }
  if (typeof val === "string" || Array.isArray(val)) {
    return val.length === 0;
  }
  if (typeof val === "number") {
    return val === 0;
  }

  return false;
};
