import { ReferenceUse } from "../types/book.type.js";
import z from "zod";

export function getProperty(
  obj: Record<string, unknown>,
  property: string,
): string {
  return callbackOnProperty(obj, property);
}

export function setProperty(
  obj: Record<string, unknown>,
  property: string,
  value: string,
): void {
  callbackOnProperty(
    obj,
    property,
    (obj: Record<string, unknown>, key: string, index?: number) => {
      if (index !== undefined) {
        (obj[key] as unknown[])[index] = value;
      } else {
        obj[key] = value;
      }
    },
  );
}

export function callbackOnProperty(
  obj: Record<string, unknown>,
  property: string,
  callback?: (
    obj: Record<string, unknown>,
    key: string,
    index?: number,
  ) => void,
): string {
  let foundProperty: string | undefined = undefined;
  property
    .split(".")
    .reduce(
      (
        currentObj: Record<string, unknown>,
        key: string,
        index: number,
        array: string[],
      ) => {
        const isLast = index === array.length - 1;
        let name: string;
        let arrayIndex: number | undefined;

        if (key.includes("[")) {
          const match = key.match(/^([^[]+)\[(\d+)\]$/);
          if (match) {
            name = match[1];
            arrayIndex = parseInt(match[2], 10);
          } else {
            throw new Error(`Invalid array notation in property: ${key}`);
          }
        } else {
          name = key;
          arrayIndex = undefined;
        }

        if (isLast) {
          if (arrayIndex !== undefined) {
            foundProperty = (currentObj[name] as unknown[])[
              arrayIndex
            ] as string;
            if (callback) {
              callback(currentObj, name, arrayIndex);
            }
          } else {
            foundProperty = currentObj[name] as string;
            if (callback) {
              callback(currentObj, name);
            }
          }
          return currentObj;
        } else {
          let nextObj: Record<string, unknown>;
          if (arrayIndex !== undefined) {
            nextObj = (currentObj[name] as unknown[])[arrayIndex] as Record<
              string,
              unknown
            >;
          } else {
            if (!currentObj[name]) {
              currentObj[name] = {};
            }
            nextObj = currentObj[name] as Record<string, unknown>;
          }
          return nextObj;
        }
      },
      obj,
    );

  if (foundProperty === undefined) {
    throw new Error(`Property ${property} not found in object`);
  }

  return foundProperty;
}

export function getZodEnumValues(enumSchema: z.ZodEnum<any>): string[] {
  return enumSchema._def.values as string[];
}
