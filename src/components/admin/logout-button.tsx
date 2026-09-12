import { logout } from "@/actions/auth"

export function LogoutButton() {
  return (
    // A plain form instead of a client component: no JS needed to end a session.
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
      >
        Salir
      </button>
    </form>
  )
}
