import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/admin/login-form"
import { isAuthenticated } from "@/server/auth/dal"

export const metadata: Metadata = {
  title: "Entrar al panel",
}

export default async function LoginPage() {
  // Verifies the signature, unlike the proxy. An already-signed-in barber goes
  // straight to his agenda; an expired cookie just sees the form.
  if (await isAuthenticated()) {
    redirect("/admin")
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Image
          src="/images/maestro-corte-full-logo.png"
          alt="Maestro Corte by Diego"
          width={1672}
          height={284}
          className="mx-auto h-auto w-48"
          priority
        />

        <h1 className="mt-10 text-center font-serif text-2xl text-foreground">
          Panel de citas
        </h1>
        <p className="mt-2 mb-8 text-center text-sm text-muted">
          Escribe la contraseña para entrar.
        </p>

        <LoginForm />

        <Link
          href="/"
          className="mt-8 block text-center text-sm text-muted transition-colors duration-200 hover:text-foreground"
        >
          ← Volver al sitio
        </Link>
      </div>
    </main>
  )
}
