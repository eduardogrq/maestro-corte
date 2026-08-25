"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { fadeUp, staggerContainer } from "@/lib/animations"

export function Experience() {
  return (
    <section id="experiencia" className="py-16 sm:py-20 lg:py-28">
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
            <div className="aspect-[4/5] rounded-2xl bg-surface overflow-hidden relative">
              <Image
                src="/images/hero-barbero-hands.png"
                alt="Manos de barbero profesional trabajando con tijeras, más de 35 años de experiencia"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
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
                <span className="font-serif text-xl sm:text-2xl text-foreground">
                  Soy Diego.
                </span>{" "}
                Llevo más de 35 años dedicado al oficio de la barbería, perfeccionando técnicas, entendiendo distintos tipos de cabello y aprendiendo algo nuevo con cada cliente.
              </p>
              <p>
                La experiencia me ha enseñado que un buen corte no consiste solamente en dominar las herramientas. Consiste en saber observar, escuchar y entender qué estilo funciona mejor para cada persona.
              </p>
              <p>
                Hoy llevo todo ese conocimiento directamente a tu domicilio, con la misma atención al detalle de siempre y la comodidad de recibir un servicio profesional sin salir de casa.
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
