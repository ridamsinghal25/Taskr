import { ZodError, flattenError } from "zod";

export type FlattenedZodError = {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
};

/**
 * Extracts first message per field using ZodError.flatten()
 */
export function extractMessagesFromFlatten(error: ZodError): string {
  const { fieldErrors }: FlattenedZodError = flattenError(error);

  for (const errors of Object.values(fieldErrors)) {
    if (errors && errors.length > 0) {
      return errors[0] || "Invalid request data";
    }
  }

  return "Invalid request data";
}
