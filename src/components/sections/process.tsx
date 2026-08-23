"use client"

import { motion } from "framer-motion"
import { process } from "@/data/locations"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { getWhatsAppUrl } from "@/data/business"

export function Process() {
  return (
    <section className="py-24 sm:py-32 lg:py-40">
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
              Cómo funciona
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight">
              Sin complicaciones.
              <br />
              <span className="text-muted">Así de simple.</span>
            </h2>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {process.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="relative"
              >
                {/* Step number */}
                <span className="block font-serif text-5xl sm:text-6xl text-accent/20 mb-3">
                  {step.number}
                </span>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-14 sm:mt-20">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors duration-200"
            >
              Agenda por WhatsApp
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
