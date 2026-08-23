"use client"

import { motion } from "framer-motion"
import { getWhatsAppUrl } from "@/data/business"
import { fadeUp, fadeIn, staggerContainer } from "@/lib/animations"

export function Hero() {
  return (
    <section className="relative min-h-dvh flex items-center pt-20">
      {/* Subtle background texture */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 w-full py-20 sm:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow with "Desde 1990" */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 mb-5 sm:mb-6"
            >
              <span className="text-sm sm:text-base text-muted font-medium tracking-wide uppercase">
                Barbería a domicilio · CDMX
              </span>
              <span className="hidden sm:inline-block w-px h-4 bg-border" />
              <span className="hidden sm:inline-block text-sm text-accent font-medium">
                Desde 1990
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-foreground"
            >
              El corte perfecto,
              <br />
              <span className="text-muted">en tu espacio.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="mt-6 sm:mt-8 text-base sm:text-lg text-muted max-w-lg leading-relaxed"
            >
              Más de 35 años de oficio llevados hasta la puerta de tu casa.
              Servicio profesional en Coyoacán y Benito Juárez.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4"
            >
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors duration-200"
              >
                <WhatsAppIcon />
                Agenda tu cita
              </a>
              <a
                href="#servicios"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-border text-sm font-medium rounded-full text-foreground hover:bg-surface transition-colors duration-200"
              >
                Ver servicios
              </a>
            </motion.div>
          </motion.div>

          {/* Hero image — desktop only */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4, duration: 0.8 }}
            className="hidden lg:block relative"
          >
            {/* TODO: Replace with real hero photo — barbero working, close-up of a fade, or tools laid out */}
            <div className="aspect-[3/4] rounded-2xl bg-surface overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center text-muted/40 text-sm text-center px-8">
                Fotografía: barbero trabajando en domicilio
              </div>
              {/* "Desde 1990" badge overlay */}
              <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-border/50">
                <p className="text-xs text-muted uppercase tracking-wider">Desde</p>
                <p className="font-serif text-2xl text-foreground leading-none">1990</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <div className="w-px h-12 bg-border relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-1/3 bg-muted"
            animate={{ y: ["0%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  )
}

function WhatsAppIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
