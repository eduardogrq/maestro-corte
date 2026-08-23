import { business, getWhatsAppUrl } from "@/data/business"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      id="contacto"
      className="border-t border-border bg-surface-dark text-background/80"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-serif text-xl text-background mb-3">
              Maestro Corte
            </p>
            <p className="text-sm leading-relaxed text-background/60">
              Barbería profesional a domicilio
              <br />
              en Ciudad de México.
            </p>
          </div>

          {/* Cobertura */}
          <div>
            <p className="text-sm font-medium text-background mb-3">
              Cobertura
            </p>
            <ul className="space-y-2 text-sm text-background/60">
              <li>Coyoacán</li>
              <li>Benito Juárez</li>
            </ul>
          </div>

          {/* Horario */}
          <div>
            <p className="text-sm font-medium text-background mb-3">Horario</p>
            <p className="text-sm text-background/60">
              {business.openingHours.days}
            </p>
            <p className="text-sm text-background/60">
              {business.openingHours.hours}
            </p>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-sm font-medium text-background mb-3">
              Contacto
            </p>
            <div className="space-y-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-background/60 hover:text-accent transition-colors duration-200"
              >
                WhatsApp
              </a>
              <a
                href={`https://instagram.com/${business.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-background/60 hover:text-accent transition-colors duration-200"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-background/40">
            © {currentYear} {business.name}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-background/40">
            Coyoacán · Benito Juárez · CDMX
          </p>
        </div>
      </div>
    </footer>
  )
}
