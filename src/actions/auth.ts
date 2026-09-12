"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  clearAttempts,
  isRateLimited,
  LOGIN_WINDOW_MINUTES,
  recordFailedAttempt,
} from "@/server/auth/rate-limit"
import { endSession, isValidAdminPassword, startSession } from "@/server/auth/session"

export interface LoginState {
  error?: string
}

async function clientIp(): Promise<string> {
  const headerList = await headers()
  const forwarded = headerList.get("x-forwarded-for")

  return (
    forwarded?.split(",")[0]?.trim() ?? headerList.get("x-real-ip") ?? "unknown"
  )
}

export async function login(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get("password")

  if (typeof password !== "string" || password.length === 0) {
    return { error: "Escribe la contraseña." }
  }

  const ip = await clientIp()

  if (await isRateLimited(ip)) {
    return {
      error: `Demasiados intentos fallidos. Espera ${LOGIN_WINDOW_MINUTES} minutos.`,
    }
  }

  if (!isValidAdminPassword(password)) {
    await recordFailedAttempt(ip)
    return { error: "Contraseña incorrecta." }
  }

  await clearAttempts(ip)
  await startSession()

  // Outside any try/catch: redirect signals by throwing.
  redirect("/admin")
}

export async function logout(): Promise<void> {
  await endSession()
  redirect("/admin/login")
}
