import type { Metadata } from "next"
import { DM_Sans, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { JsonLd } from "@/components/layout/json-ld"
import { business } from "@/data/business"

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
})

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: "Maestro Corte by Diego — Barbería a domicilio en CDMX",
    template: "%s | Maestro Corte by Diego",
  },
  description: business.description,
  keywords: [
    "barbería a domicilio",
    "barbería a domicilio CDMX",
    "barbero a domicilio",
    "corte de cabello a domicilio",
    "barbería Coyoacán",
    "barbería Benito Juárez",
    "corte de cabello para hombre",
  ],
  authors: [{ name: "Maestro Corte by Diego" }],
  creator: "Maestro Corte by Diego",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: business.url,
    siteName: business.name,
    title: "Maestro Corte by Diego — Barbería a domicilio en CDMX",
    description: business.description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Maestro Corte by Diego — Barbería profesional a domicilio en Ciudad de México",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maestro Corte by Diego — Barbería a domicilio en CDMX",
    description: business.description,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: business.url,
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${dmSans.variable} ${playfair.variable} antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-background text-foreground">
        <JsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
