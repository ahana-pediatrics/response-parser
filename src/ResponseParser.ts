import { Optional } from "@ahanapediatrics/ahana-fp";
import { isDate as dfnsIsDate } from "date-fns";
import { getKeys } from "./getKeys";
import { isNothing } from "./isNothing";
import { JSONType } from "./JSONType";
import { PayloadParseError } from "./PayloadParseError";

const getType = (json: unknown) =>
  Array.isArray(json) ? "array" : json === null ? "null" : typeof json;

const isBoolean = (json: unknown): json is boolean =>
  getType(json) === "boolean";
const isDate = (json: unknown): json is Date => dfnsIsDate(json);
const isString = (json: unknown): json is string => getType(json) === "string";
const isNumber = (json: unknown): json is number => getType(json) === "number";

export type Processor<V> = ((j: JSONType<V>) => V) & { optional?: boolean };

/**
 * Defines a numeric type.
 *
 * Will convert a string to an integer if required, although we shouldn't really
 * be getting numerics as string in JSON.
 *
 * @param json
 */
export const $num = (json: JSONType<number | string>): number => {
  const type = getType(json);

  if (isNumber(json)) {
    return json;
  }
  if (isString(json) && json.length > 0) {
    return parseInt(json, 10);
  }

  throw new Error(`Could not parse '${json}' of type ${type} into number`);
};

/**
 * Defines a string type
 *
 * @param json
 */
export const $str = (json: JSONType<string>): string => {
  const type = getType(json);

  if (isString(json)) {
    return json;
  }

  throw new Error(`Could not parse '${json}' of type ${type} into string`);
};

/**
 * Defines a boolean type.
 *
 * NB: This does not support "booleanish" values like 1 or "true" or any
 * other such malarkey
 *
 * @param json
 */
export const $bool = (json: JSONType<boolean>): boolean => {
  const type = getType(json);

  if (isBoolean(json)) {
    return json;
  }

  throw new Error(`Could not parse '${json}' of type ${type} into boolean`);
};

/**
 * Defines a Date type.
 *
 * This is really just a validated and converted String type
 *
 * @param json
 */
export const $date = (json: JSONType<Date>): Date => {
  const type = getType(json);

  if (isDate(json)) {
    return json;
  }
  if (isString(json)) {
    try {
      return new Date(json);
    } catch (e) {
      throw new Error(`Could not parse '${json}' of type ${type} into date`);
    }
  }

  throw new Error(`Could not parse '${json}' of type ${type} into date`);
};

/**
 * Defines an Optional<T> type.
 *
 * @param parser a type parser that parses T types
 */
export const $opt = <T>(parser: Processor<T>): Processor<Optional<T>> => {
  const processor = (json: JSONType<T>) => {
    if (isNothing(json)) {
      return Optional.empty<T>();
    }

    const val = parser(json);

    return Optional.of(val);
  };
  processor.optional = true;

  return processor as Processor<Optional<T>>;
};

/**
 * Defines a nullable type T.
 *
 * Essentially, takes a parser that returns a T type and makes
 * it return a T | null type
 *
 * @param parser
 */
export const $nullable = <T>(parser: (j: JSONType<T>) => T) => (
  json: JSONType<T | null>
): T | null => {
  const type = getType(json);
  if (type === "null") {
    return null;
  }
  return parser(json);
};

/**
 * Defines an array of T types, i.e. T[]
 *
 * Takes a parser that returns a T type
 *
 * @param parser
 */
export const $arr = <T>(parser: (j: JSONType<T>) => T) => (
  json: JSONType<T[]>
): T[] => {
  const type = getType(json);
  if (getType(json) !== "array") {
    throw new Error(`Could not parse '${json}' of type ${type} into array`);
  }

  return (json as JSONType<T>[]).map(parser);
};

/**
 * Defines an object type T
 *
 * In order to assert the _actual_ type, this must be invoked
 * as `$obj<Type>()`
 *
 */
export const $obj = <T extends object>() => (json: JSONType<T>): T => {
  const type = getType(json);
  if (getType(json) !== "object") {
    throw new Error(`Could not parse '${json}' of type ${type} into object`);
  }

  return (json as unknown) as T;
};

/**
 * Defines a "choice" type, AKA a union of literal strings
 *
 * Takes an array of the possible options. Thus:
 *
 * ```
 * type Foo = 'Bar' | 'Baz';
 * ```
 *
 * Model type:
 *
 * ```
 * {
 *   ...,
 *   foo: Foo
 * }
 * ```
 *
 * Template:
 *
 * ```
 * {
 *   ...,
 *   foo: $choice<Foo>(['Bar','Baz'])
 * }
 * ```
 *
 * @param options
 */
export const $choice = <T extends string>(options: ReadonlyArray<T>) => (
  json: JSONType<T>
): T => {
  const type = getType(json);
  try {
    const val = $str(json) as T;
    if (options.includes(val)) {
      return val;
    }
    throw new Error(
      `Value '${val}' is not a member  of [${options.join(", ")}]`
    );
  } catch (e) {
    throw new Error(
      `Could not parse '${json}' of type ${type} into choice of [${options.join(
        ", "
      )}]`
    );
  }
};

/**
 * Defines an enum type
 *
 * Just like $obj, needs to be invoked with a type: `$enum<EnumType>()`
 *
 * @param en
 */
export const $enum = <T extends {}>(en: T) => (
  json: JSONType<T[keyof T]>
): T[keyof T] => {
  const type = getType(json);
  try {
    const val = ($str(json as string) as unknown) as T[keyof T];
    const key = getKeys(en).find((k) => en[k] === val);

    if (typeof key !== "undefined" && key in en) {
      return en[key];
    }
    throw new Error(`Value '${val}' is not a member  of {${en}}`);
  } catch (e) {
    throw new Error(`Could not parse '${json}' of type ${type} into enum`);
  }
};

type Template<T> = { [K in keyof T]: Processor<T[K]> };
export const getParser = <T>(templateFn: () => Template<T>) => (
  json: JSONType<T>
): T => {
  const template = templateFn();
  const templateKeys = getKeys(template);
  const obj = {};
  let id = "unknown";
  if ("id" in json) {
    //@ts-ignore
    id = `${json.id}`;
  }

  const errorRegex = /Key '(.+\[.+\])': (.*)/;
  templateKeys.forEach((key) => {
    const processor = template[key];
    if (!(key in json) && !processor.optional) {
      let errorKey = key;
      throw new PayloadParseError(
        `Key '${errorKey}[${id}]': Missing from response.`
      );
    }
    try {
      //@ts-ignore
      obj[key] = processor(json[key]);
    } catch (e) {
      let errorKey = `${key}[${id}]`;
      const [, loc, msg] = e.message.match(errorRegex) ?? [];
      if (loc) {
        errorKey = `${key}->[${id}]${loc}`;
      }
      throw new PayloadParseError(`Key '${errorKey}': ${msg ?? e.message}`);
    }
  });

  return (obj as unknown) as T;
};
