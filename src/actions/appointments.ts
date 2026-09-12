"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireSession } from "@/server/auth/dal"
import {
  cancelAppointment as cancelAppointmentService,
  createAppointment,
  editAppointment,
  syncToCalendar,
} from "@/server/appointments/service"
import { findAppointmentById } from "@/server/appointments/repository"
import {
  appointmentInputSchema,
  readFormValues,
  toFieldErrors,
  type AppointmentFormValues,
  type FieldErrors,
} from "@/server/appointments/schemas"

export interface AppointmentFormState {
  /** Echoed back so a failed submit never wipes what was typed. */
  values?: AppointmentFormValues
  fieldErrors?: FieldErrors
  /** Non-blocking conflicts. The form shows them with an "agendar de todos modos" button. */
  warnings?: string[]
  error?: string
}

function unexpected(error: unknown): AppointmentFormState {
  console.error("[appointments]", error)

  return {
    error:
      error instanceof Error
        ? error.message
        : "Algo falló al guardar. Intenta de nuevo.",
  }
}

export async function createAppointmentAction(
  _previous: AppointmentFormState,
  formData: FormData
): Promise<AppointmentFormState> {
  // Never trust the proxy: it only saw that a cookie existed.
  await requireSession()

  const values = readFormValues(formData)
  const parsed = appointmentInputSchema.safeParse(values)

  if (!parsed.success) {
    return { values, fieldErrors: toFieldErrors(parsed.error) }
  }

  // Generated in the browser and kept stable across retries, so a double tap on
  // a slow connection collides on the unique index instead of booking twice.
  const clientToken = formData.get("clientToken")
  const force = formData.get("force") === "1"

  if (typeof clientToken !== "string" || clientToken.length === 0) {
    return { values, error: "Recarga la página e intenta de nuevo." }
  }

  let appointmentId: string

  try {
    const result = await createAppointment(parsed.data, clientToken, force)

    if (result.kind === "warnings") {
      return { values, warnings: result.warnings }
    }

    appointmentId = result.appointment.id
  } catch (error) {
    return { ...unexpected(error), values }
  }

  revalidatePath("/admin")
  // Outside the try: `redirect` works by throwing.
  redirect(`/admin/appointments/${appointmentId}`)
}

export async function editAppointmentAction(
  _previous: AppointmentFormState,
  formData: FormData
): Promise<AppointmentFormState> {
  await requireSession()

  const id = formData.get("id")

  if (typeof id !== "string" || id.length === 0) {
    return { error: "Recarga la página e intenta de nuevo." }
  }

  const values = readFormValues(formData)
  const parsed = appointmentInputSchema.safeParse(values)

  if (!parsed.success) {
    return { values, fieldErrors: toFieldErrors(parsed.error) }
  }

  try {
    const result = await editAppointment(id, parsed.data, formData.get("force") === "1")

    if (result.kind === "warnings") {
      return { values, warnings: result.warnings }
    }
  } catch (error) {
    return { ...unexpected(error), values }
  }

  revalidatePath("/admin")
  revalidatePath(`/admin/appointments/${id}`)
  redirect(`/admin/appointments/${id}`)
}

export async function cancelAppointmentAction(formData: FormData): Promise<void> {
  await requireSession()

  const id = formData.get("id")

  if (typeof id !== "string" || id.length === 0) {
    return
  }

  await cancelAppointmentService(id)

  revalidatePath("/admin")
  revalidatePath(`/admin/appointments/${id}`)
}

/**
 * Manual retry for the "no sincronizada" badge. Idempotent: the Calendar event
 * id is derived from the appointment id, so this can be pressed repeatedly
 * without duplicating anything.
 */
export async function retrySyncAction(formData: FormData): Promise<void> {
  await requireSession()

  const id = formData.get("id")

  if (typeof id !== "string" || id.length === 0) {
    return
  }

  const appointment = await findAppointmentById(id)

  // Guard, not just a hidden button: re-syncing a cancelled appointment would
  // put the event back on the barber's calendar.
  if (!appointment || appointment.status === "cancelled") {
    return
  }

  await syncToCalendar(appointment)

  revalidatePath("/admin")
  revalidatePath(`/admin/appointments/${id}`)
}
