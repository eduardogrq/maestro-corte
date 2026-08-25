"use client"

import { motion } from "framer-motion"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { business, getWhatsAppUrl } from "@/data/business"

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
            Escríbele a Diego por WhatsApp y agenda el día y horario que mejor
            te funcione. Llegamos a tu domicilio en Coyoacán y Benito Juárez.
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

          {/* Contact info + social */}
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
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
            <span className="hidden sm:block w-px h-3.5 bg-background/20" />
            <div className="flex items-center gap-4">
              <a
                href={`https://instagram.com/${business.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-background/60 hover:text-accent transition-colors duration-200"
              >
                Instagram
              </a>
              <a
                href={business.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-background/60 hover:text-accent transition-colors duration-200"
              >
                Facebook
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
