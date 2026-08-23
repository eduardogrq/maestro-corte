"use client"

import { motion } from "framer-motion"
import { services, packages, firstVisitPrice } from "@/data/services"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { getWhatsAppUrl } from "@/data/business"

export function Services() {
  return (
    <section id="servicios" className="py-20 sm:py-28 lg:py-36 bg-surface">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="max-w-2xl mb-12 sm:mb-16">
            <p className="text-sm text-accent font-medium tracking-wide uppercase mb-4">
              Servicios
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight">
              Cada servicio, adaptado a ti.
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              Todo lo que necesitas de una barbería profesional, sin salir de
              tu casa. Equipo esterilizado, productos de calidad y la atención
              que mereces.
            </p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap gap-4 sm:gap-6 mb-12 sm:mb-16"
          >
            {[
              { label: "Equipo profesional", icon: "✂" },
              { label: "Herramientas sanitizadas", icon: "✓" },
              { label: "Servicio personalizado", icon: "★" },
            ].map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm text-muted"
              >
                <span className="text-accent text-xs">{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </motion.div>

          {/* First visit promo */}
          <motion.div
            variants={fadeUp}
            className="mb-12 sm:mb-16 p-5 sm:p-6 rounded-xl border border-accent/30 bg-background"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">
                  ¿Primera vez con Maestro Corte?
                </p>
                <p className="text-sm text-muted mt-1">
                  Tu primer corte de cabello por un precio especial de bienvenida.
                </p>
              </div>
              <p className="font-serif text-3xl text-accent shrink-0">
                {firstVisitPrice.price}
              </p>
            </div>
          </motion.div>

          {/* Services list */}
          <div className="space-y-0 divide-y divide-border">
            {services.map((service, index) => (
              <motion.article
                key={service.id}
                variants={fadeUp}
                className="group py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-baseline"
              >
                {/* Number */}
                <span className="hidden sm:block sm:col-span-1 text-sm text-muted/50 font-medium tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Name */}
                <h3 className="sm:col-span-3 font-serif text-xl sm:text-2xl text-foreground group-hover:text-accent transition-colors duration-300">
                  {service.name}
                </h3>

                {/* Description */}
                <p className="sm:col-span-5 text-muted leading-relaxed text-sm sm:text-base">
                  {service.description}
                </p>

                {/* Duration + Price */}
                <div className="sm:col-span-3 flex items-baseline justify-between sm:flex-col sm:items-end gap-1">
                  <span className="font-serif text-lg sm:text-xl text-foreground">
                    {service.price}
                  </span>
                  <span className="text-xs text-muted/70">
                    {service.duration}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Packages */}
          <motion.div variants={fadeUp} className="mt-12 sm:mt-16">
            <h3 className="text-sm text-accent font-medium tracking-wide uppercase mb-6">
              Paquetes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-5 sm:p-6 rounded-xl border border-border bg-background flex flex-col justify-between gap-4"
                >
                  <div>
                    <h4 className="font-serif text-xl text-foreground">
                      {pkg.name}
                    </h4>
                    <p className="text-sm text-muted mt-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>
                  <p className="font-serif text-2xl text-accent">{pkg.price}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-12 sm:mt-16">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors duration-200"
            >
              Agenda tu cita
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
