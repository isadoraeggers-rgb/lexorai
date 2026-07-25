import { z } from "zod";
import { BRAZILIAN_STATES } from "@/types/database.types";

/** Digits-only OAB number, optionally with thousands dots: 49.412, 123456, 58741. */
const OAB_NUMBER_DIGITS = /^\d{1,3}(\.\d{3})*$|^\d{3,7}$/;

export const oabNumberSchema = z
  .string()
  .trim()
  .min(1, "Informe o número da OAB")
  .refine((val) => OAB_NUMBER_DIGITS.test(val.replace(/\s/g, "")), {
    message: "Número da OAB inválido. Use apenas dígitos, ex.: 49.412",
  });

export const oabStateSchema = z.enum(BRAZILIAN_STATES, {
  message: "Selecione a seccional (UF) da OAB",
});

export const oabRegistrationSchema = z.object({
  oab_state: oabStateSchema,
  oab_number: oabNumberSchema,
  practice_areas: z.string().optional().or(z.literal("")),
});

/** Adds thousands-separator dots as the user types digits: "49412" -> "49.412". */
export function maskOabNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatOab(state: string, number: string) {
  return `OAB/${state.toUpperCase()} ${number}`;
}

/** Full "OAB/RS 49.412" format check, used when validating a single pasted string. */
const OAB_FULL_FORMAT = /^OAB\/([A-Z]{2})\s+(\d{1,3}(?:\.\d{3})*|\d{3,7})$/i;

export function parseOabString(value: string): { state: string; number: string } | null {
  const match = value.trim().match(OAB_FULL_FORMAT);
  if (!match) return null;
  return { state: match[1].toUpperCase(), number: match[2] };
}
