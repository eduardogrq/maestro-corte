"use client"

import { motion } from "framer-motion"
import { fadeUp, staggerContainer } from "@/lib/animations"

export function Experience() {
  return (
    <section id="experiencia" className="py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Image */}
          <motion.div variants={fadeUp} className="relative order-2 lg:order-1">
            {/* TODO: Replace with real photo — close-up of hands working, tools, detail shot */}
            <div className="aspect-[4/5] rounded-2xl bg-surface overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-muted/40 text-sm">
                Fotografía: manos de barbero trabajando
              </div>
            </div>
            {/* Accent detail */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-accent/30 rounded-2xl -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div variants={fadeUp} className="order-1 lg:order-2">
            <p className="text-sm text-accent font-medium tracking-wide uppercase mb-4">
              Tradición y oficio
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight">
              Más de 35 años
              <br />
              perfeccionando cada corte.
            </h2>
            <div className="mt-6 sm:mt-8 space-y-4 text-muted leading-relaxed">
              <p>
                Empecé con tijeras y navaja antes de que existieran las
                máquinas modernas. Cada técnica que domino la aprendí sobre
                cabello real, no en un curso de fin de semana.
              </p>
              <p>
                Tres décadas y media me dieron algo que no se consigue con
                prisa: la capacidad de leer el cabello, entender lo que cada
                cliente necesita y ejecutarlo con precisión en el primer
                intento.
              </p>
              <p>
                Hoy llevo esa experiencia directamente a tu domicilio en
                Ciudad de México. Sin filas, sin espera, sin prisa.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-6">
              <div>
                <p className="font-serif text-3xl sm:text-4xl text-foreground">
                  Desde 1990
                </p>
                <p className="text-sm text-muted mt-1">más de 35 años de oficio</p>
              </div>
              <div>
                <p className="font-serif text-3xl sm:text-4xl text-foreground">
                  A domicilio
                </p>
                <p className="text-sm text-muted mt-1">en Coyoacán y Benito Juárez</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
