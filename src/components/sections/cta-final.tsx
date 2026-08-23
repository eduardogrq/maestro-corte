"use client"

import { motion } from "framer-motion"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { getWhatsAppUrl } from "@/data/business"

export function CtaFinal() {
  return (
    <section className="py-24 sm:py-32 lg:py-40 bg-surface-dark text-background">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.h2
            variants={fadeUp}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight text-background"
          >
            Tu próximo corte,
            <br />
            sin salir de casa.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-background/60 leading-relaxed"
          >
            Escríbenos por WhatsApp y agenda el día y horario que mejor te
            funcione. Llegamos a tu domicilio en Coyoacán y Benito Juárez.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 sm:mt-10">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-background text-sm font-medium rounded-full hover:bg-accent-hover transition-colors duration-200"
            >
              Consulta disponibilidad
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
