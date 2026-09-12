import "server-only"
import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "Connection string de Neon (Dashboard → Connection Details)"),

  ADMIN_PASSWORD: z
    .string()
    .min(12, "Usa al menos 12 caracteres. Genérala aleatoria, no la escribas a mano"),

  SESSION_SECRET: z
    .string()
    .min(32, "Al menos 32 caracteres. Genérala con: openssl rand -base64 32"),

  // Debe ser el correo LITERAL de la cuenta de Google del barbero.
  // Validamos que sea un email a propósito: el error más común de este setup
  // es poner "primary", que apunta al calendario de la cuenta de servicio.
  GOOGLE_CALENDAR_ID: z
    .email('Debe ser el correo de Google del barbero, no "primary"'),

  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.email(
    "Termina en @<proyecto>.iam.gserviceaccount.com"
  ),

  GOOGLE_PRIVATE_KEY: z
    .string()
    .min(1, 'Campo "private_key" del JSON de la cuenta de servicio'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const { fieldErrors } = z.flattenError(parsed.error)
  const detail = Object.entries(fieldErrors)
    .map(([key, messages]) => `  · ${key}: ${messages?.join(" / ")}`)
    .join("\n")

  throw new Error(
    `Variables de entorno inválidas o faltantes:\n${detail}\n\nRevisa .env.example y tu .env.local`
  )
}

export const env = {
  ...parsed.data,
  // El JSON de Google trae la llave con \n escapados; el parser de PEM
  // necesita saltos de línea reales.
  GOOGLE_PRIVATE_KEY: parsed.data.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
} as const
