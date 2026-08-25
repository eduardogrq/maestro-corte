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
            <ul className="space-y-2 text-sm text-background/60">
              {business.openingHours.schedule.map((item) => (
                <li key={item.days}>
                  <span className="block">{item.days}</span>
                  <span className="block">{item.hours}</span>
                </li>
              ))}
            </ul>
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
                className="inline-flex items-center gap-1.5 text-sm text-background/60 hover:text-accent transition-colors duration-200"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                +52 56 4051 0011
              </a>
              <a
                href={`https://instagram.com/${business.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-background/60 hover:text-accent transition-colors duration-200"
              >
                @{business.instagram}
              </a>
              <a
                href={business.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-background/60 hover:text-accent transition-colors duration-200"
              >
                Facebook
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
