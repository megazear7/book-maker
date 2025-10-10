import z, { ZodSchema } from "zod";
import fs from "fs";
import { BookReference, LoadedBookReference } from "../types/book.type.js";
import mammoth from "mammoth";
import { PdfReader } from "pdfreader";
import TurndownService from "turndown";

/* eslint-disable */
export function createEmpty<T>(schema: ZodSchema<T>): T {
  if (schema instanceof z.ZodString) {
    // Handle string-based types
    if (schema.isUUID)
      return schema.parse("00000000-0000-0000-0000-000000000000") as T;
    if (schema.isEmail) return schema.parse("") as T; // Empty string (valid unless nonempty is specified)
    if (schema.isDatetime) return schema.parse("2025-06-11T06:18:00.000Z") as T;
    // Handle min/max length for regular strings
    const checks = schema._def.checks as { kind: string; value?: number }[];
    const minLength = checks.find((c) => c.kind === "min")?.value ?? 0;
    // Return a string of '0' characters with the minimal required length
    return schema.parse("0".repeat(minLength)) as T;
  }
  if (schema instanceof z.ZodNumber) {
    // Handle numbers with minimal valid value
    const checks = schema._def.checks as { kind: string; value?: number }[];
    const minCheck = checks.find((c) => c.kind === "min");
    const min = minCheck && "value" in minCheck ? minCheck.value || 0 : 0;
    const isInt = checks.some((c) => c.kind === "int");
    return schema.parse(isInt ? Math.max(Math.floor(min), 0) : min) as T;
  }
  if (schema instanceof z.ZodBoolean) {
    return schema.parse(false) as T;
  }
  if (schema instanceof z.ZodArray) {
    return schema.parse([]) as T;
  }
  if (schema instanceof z.ZodObject) {
    // Recursively generate minimal values for object properties
    const shape = schema.shape;
    const result: Record<string, any> = {};
    for (const key in shape) {
      result[key] = createEmpty(shape[key]);
    }
    return schema.parse(result) as T;
  }
  if (schema instanceof z.ZodEnum) {
    // Return the first enum value
    return schema.parse(schema.options[0]) as T;
  }
  if (schema instanceof z.ZodOptional) {
    // Return undefined for optional fields
    return schema.parse(undefined) as T;
  }
  if (schema instanceof z.ZodNullable) {
    // Return null for nullable fields
    return schema.parse(null) as T;
  }
  if (schema instanceof z.ZodUnion) {
    // Use the first option of the union
    return createEmpty(schema.options[0]);
  }
  if (schema instanceof z.ZodLiteral) {
    // Return the literal value
    return schema.parse(schema.value) as T;
  }
  // Default case for unsupported types
  return schema.parse(null) as T;
}
/* eslint-enable */

export async function loadFiles(
  ref: BookReference,
): Promise<LoadedBookReference> {
  const filePath = ref.file;
  const extension = filePath.split(".").pop()?.toLowerCase();

  let content: string;

  if (extension === "txt") {
    content = fs.readFileSync(filePath, "utf-8");
  } else if (extension === "docx") {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.convertToHtml({ buffer });
    const turndownService = new TurndownService();
    content = turndownService.turndown(result.value);
  } else if (extension === "pdf") {
    const buffer = fs.readFileSync(filePath);

    const textItems: string[] = [];
    const reader = new PdfReader();

    await new Promise<void>((resolve, reject) => {
      reader.parseBuffer(buffer, (err, item) => {
        if (err) {
          reject(err);
        } else if (!item) {
          // End of file
          resolve();
        } else if (item.text) {
          textItems.push(item.text);
        }
      });
    });

    content = textItems.join(" ");
  } else {
    // Default to reading as text for unknown extensions
    content = fs.readFileSync(filePath, "utf-8");
  }

  return {
    ...ref,
    fileContent: content,
  };
}
