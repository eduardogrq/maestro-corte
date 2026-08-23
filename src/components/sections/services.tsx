"use client"

import { motion } from "framer-motion"
import { services } from "@/data/services"
import { fadeUp, staggerContainer } from "@/lib/animations"

export function Services() {
  return (
    <section id="servicios" className="py-24 sm:py-32 lg:py-40 bg-surface">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="max-w-2xl mb-14 sm:mb-20">
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

          {/* Services list — editorial style, not grid cards */}
          <div className="space-y-0 divide-y divide-border">
            {services.map((service, index) => (
              <motion.article
                key={service.id}
                variants={fadeUp}
                className="group py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 items-start"
              >
                {/* Number */}
                <span className="hidden sm:block sm:col-span-1 text-sm text-muted/50 font-medium tabular-nums pt-1">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Name */}
                <h3 className="sm:col-span-3 font-serif text-xl sm:text-2xl text-foreground group-hover:text-accent transition-colors duration-300">
                  {service.name}
                </h3>

                {/* Description */}
                <p className="sm:col-span-6 text-muted leading-relaxed text-sm sm:text-base">
                  {service.description}
                </p>

                {/* Duration */}
                <span className="sm:col-span-2 text-sm text-muted/70 sm:text-right">
                  {service.duration}
                </span>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
