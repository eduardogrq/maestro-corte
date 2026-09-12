import "server-only"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { env } from "@/server/env"
import * as schema from "./schema"

// Driver HTTP (no TCP): en funciones serverless no hay pool que valga la pena
// mantener caliente, y evita la penalización de handshake en cada cold start.
// Contrapartida: no hay transacciones interactivas.
const sql = neon(env.DATABASE_URL)

export const db = drizzle(sql, { schema })
