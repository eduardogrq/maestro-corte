import Image from "next/image"
import Link from "next/link"
import { LogoutButton } from "@/components/admin/logout-button"
import { requireSession } from "@/server/auth/dal"

export default async function PanelLayout({
  children,
}: LayoutProps<"/admin">) {
  // Real check. `proxy.ts` only saw that a cookie existed; a forged one dies here.
  await requireSession()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-5">
          <Link href="/admin" className="block">
            <Image
              src="/images/maestro-corte-full-logo.png"
              alt="Maestro Corte by Diego"
              width={1672}
              height={284}
              className="h-auto w-32"
              priority
            />
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6">{children}</main>
    </div>
  )
}
