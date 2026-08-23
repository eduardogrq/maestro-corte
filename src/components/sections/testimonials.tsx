"use client"

import { motion } from "framer-motion"
import { testimonials } from "@/data/testimonials"
import { fadeUp, staggerContainer } from "@/lib/animations"

export function Testimonials() {
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
              Clientes
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight">
              La confianza se construye
              <br />
              <span className="text-muted">corte a corte.</span>
            </h2>
          </motion.div>

          {/* Testimonials grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {testimonials.map((testimonial) => (
              <motion.blockquote
                key={testimonial.id}
                variants={fadeUp}
                className="p-6 sm:p-8 rounded-2xl border border-border bg-background"
              >
                <p className="text-foreground leading-relaxed text-sm sm:text-base">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <footer className="mt-5 flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center">
                    <span className="text-xs font-medium text-muted">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted">
                      {testimonial.location} · {testimonial.service}
                    </p>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
