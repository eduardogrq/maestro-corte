import { readFileSync } from "node:fs"
import { join } from "node:path"
import type { Config } from "drizzle-kit"

// drizzle-kit solo carga `.env`, mientras que Next usa `.env.local`.
// Leemos ese archivo aquí para tener una sola fuente de la connection string.
function readFromEnvLocal(key: string): string | undefined {
  try {
    const file = readFileSync(join(process.cwd(), ".env.local"), "utf8")
    const line = file
      .split("\n")
      .find((candidate) => candidate.startsWith(`${key}=`))

    return line
      ?.slice(key.length + 1)
      .trim()
      .replace(/^["']|["']$/g, "")
  } catch {
    return undefined
  }
}

const url = process.env.DATABASE_URL ?? readFromEnvLocal("DATABASE_URL")

if (!url) {
  throw new Error(
    "Falta DATABASE_URL. Ponla en .env.local o expórtala en el entorno."
  )
}

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
} satisfies Config
