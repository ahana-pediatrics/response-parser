import { Optional } from "@ahanapediatrics/ahana-fp";

type Methods<T extends object> = NonNullable<
  {
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T]
>;

/**
 * Note that this doesn't exclude getters and setters as they appear as fields, not methods
 */
export type WithoutMethods<T extends object> = Omit<T, Methods<T>>;

export type JSONType<T> = T extends Date
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends string
  ? string
  : T extends Array<infer F>
  ? JSONNonArrayType<F>[]
  : T extends {}
  ? __JSONObjectType<WithoutMethods<T>>
  : never;

export type JSONNonArrayType<T> = T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends string
  ? string
  : T extends {}
  ? __JSONObjectType<WithoutMethods<T>>
  : never;

type __JSONObjectType<T extends object> = {
  [K in keyof T]: T[K] extends Optional<infer U>
    ? JSONType<U> | undefined
    : JSONType<T[K]>;
};

export type OptionalToUndefinable<T extends object> = {
  [K in keyof T]: T[K] extends Optional<infer U> ? U | undefined : T[K];
};

export type BasicJWT = {
  iss: string;
  sub: string;
  aud: string | string[];
  iat: number;
  exp: number;
  azp?: string;
  scope: string;
};
