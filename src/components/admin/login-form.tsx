"use client"

import { useActionState } from "react"
import { login, type LoginState } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: LoginState = {}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState)

  return (
    <form action={action} className="flex flex-col gap-5">
      <Field htmlFor="password" label="Contraseña" error={state.error}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          // The panel is opened between haircuts: focus the only field so the
          // keyboard is already up.
          autoFocus
          required
          invalid={Boolean(state.error)}
          disabled={pending}
        />
      </Field>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  )
}
