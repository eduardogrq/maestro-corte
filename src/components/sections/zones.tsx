"use client"

import { motion } from "framer-motion"
import { zones } from "@/data/locations"
import { fadeUp, staggerContainer } from "@/lib/animations"

export function Zones() {
  return (
    <section id="cobertura" className="py-24 sm:py-32 lg:py-40 bg-surface">
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
              Cobertura
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight">
              Servicio a domicilio
              <br />
              en el sur de la ciudad.
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              Atendemos en Coyoacán y Benito Juárez, con servicio
              profesional a domicilio en el sur de Ciudad de México.
            </p>
          </motion.div>

          {/* Zones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {zones.map((zone) => (
              <motion.article
                key={zone.slug}
                variants={fadeUp}
                className="p-6 sm:p-8 rounded-2xl border border-border bg-background hover:border-accent/30 transition-colors duration-300"
              >
                <h3 className="font-serif text-xl sm:text-2xl text-foreground mb-3">
                  {zone.name}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {zone.description}
                </p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
