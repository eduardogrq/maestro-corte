import "server-only"
import { z } from "zod"
import { findBookableService } from "@/data/services"
import { normalizeMxPhone } from "@/lib/phone"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

/**
 * Trims and turns "" into undefined, so an untouched optional field is absent
 * rather than an empty string sitting in the database.
 */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .transform((value) => (value.length === 0 ? undefined : value))
    .optional()

export const appointmentInputSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "Escribe el nombre del cliente.")
    .max(80, "Máximo 80 caracteres."),

  // Validated *and* normalized here: everything downstream (WhatsApp link, tel:
  // link, duplicate detection) assumes the canonical 52########## form.
  clientPhone: z
    .string()
    .trim()
    .min(1, "Escribe el teléfono.")
    .transform((value) => normalizeMxPhone(value))
    .refine((value): value is string => value !== null, {
      message: "Teléfono inválido. Escribe 10 dígitos.",
    }),

  serviceId: z
    .string()
    .min(1, "Elige un servicio.")
    .refine((value) => findBookableService(value) !== undefined, {
      message: "Ese servicio ya no existe en el catálogo.",
    }),

  date: z.string().regex(DATE_PATTERN, "Elige una fecha."),
  time: z.string().regex(TIME_PATTERN, "Elige una hora."),

  address: optionalText(200),
  notes: optionalText(500),
})

export type AppointmentInput = z.output<typeof appointmentInputSchema>

/**
 * Every field the form renders, kept as raw strings. When validation fails we
 * echo this back so the barber never loses what he already typed — retyping a
 * phone number standing in a client's living room is the worst possible outcome.
 */
export interface AppointmentFormValues {
  clientName: string
  clientPhone: string
  serviceId: string
  date: string
  time: string
  address: string
  notes: string
}

export function readFormValues(formData: FormData): AppointmentFormValues {
  const read = (key: string): string => {
    const value = formData.get(key)
    return typeof value === "string" ? value : ""
  }

  return {
    clientName: read("clientName"),
    clientPhone: read("clientPhone"),
    serviceId: read("serviceId"),
    date: read("date"),
    time: read("time"),
    address: read("address"),
    notes: read("notes"),
  }
}

export type FieldErrors = Partial<Record<keyof AppointmentFormValues, string>>

/**
 * First message per field: one clear error beats a stack of them on a phone.
 * Walks `issues` instead of `flattenError` because the transform on `clientPhone`
 * makes the flattened type too loose to index safely.
 */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {}

  for (const issue of error.issues) {
    const key = issue.path[0]

    if (typeof key !== "string" || key in result) continue

    result[key as keyof AppointmentFormValues] = issue.message
  }

  return result
}
