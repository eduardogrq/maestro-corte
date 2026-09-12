import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const appointmentStatus = pgEnum("appointment_status", [
  "scheduled",
  "completed",
  "cancelled",
])

export const calendarSyncStatus = pgEnum("calendar_sync_status", [
  "pending",
  "synced",
  "failed",
])

export const appointments = pgTable(
  "appointments",
  {
    // Generado en la app, no por la base de datos: de este UUID derivamos el
    // ID del evento de Calendar, y lo necesitamos antes de insertar.
    id: uuid("id").primaryKey(),

    // Idempotencia: si el mismo formulario se envía dos veces (conexión lenta,
    // doble tap), el segundo INSERT choca aquí en lugar de crear una cita duplicada.
    clientToken: text("client_token").notNull().unique(),

    clientName: text("client_name").notNull(),
    clientPhone: text("client_phone").notNull(),

    serviceId: text("service_id").notNull(),

    // Variantes del servicio base. Se guardan aparte del snapshot porque el
    // formulario de edición necesita volver a marcarlas, y "Corte + barba ·
    // Amigos" como texto no se puede desarmar de forma confiable.
    groupId: text("group_id").notNull().default("solo"),
    withBeard: boolean("with_beard").notNull().default(false),
    firstVisit: boolean("first_visit").notNull().default(false),

    // Snapshot del catálogo al momento de agendar, ya con las variantes
    // aplicadas. Si mañana sube el precio de un corte, el historial no se
    // reescribe.
    serviceName: text("service_name").notNull(),
    priceMxn: integer("price_mxn").notNull(),
    durationMin: integer("duration_min").notNull(),

    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    // Desnormalizado a propósito: permite detectar solapes con una sola
    // comparación indexable en lugar de calcular la duración en cada query.
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),

    address: text("address"),
    notes: text("notes"),

    status: appointmentStatus("status").notNull().default("scheduled"),

    calendarEventId: text("calendar_event_id"),
    calendarSync: calendarSyncStatus("calendar_sync").notNull().default("pending"),
    calendarError: text("calendar_error"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("appointments_starts_at_idx").on(table.startsAt)]
)

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // sha256(ip + SESSION_SECRET): no guardamos IPs en claro.
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("login_attempts_ip_created_idx").on(table.ipHash, table.createdAt)]
)

export type Appointment = typeof appointments.$inferSelect
export type NewAppointment = typeof appointments.$inferInsert
