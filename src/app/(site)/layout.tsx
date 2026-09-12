import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { JsonLd } from "@/components/layout/json-ld"

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh flex flex-col">
      <JsonLd />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
