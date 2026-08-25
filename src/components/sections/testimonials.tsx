"use client"

import { motion } from "framer-motion"
import { testimonials } from "@/data/testimonials"
import { business } from "@/data/business"
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

          {/* Google Reviews link */}
          <motion.div variants={fadeUp} className="mt-12 sm:mt-16 flex justify-center">
            <a
              href={business.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full border border-border bg-background hover:border-accent/50 transition-colors duration-200"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="text-accent shrink-0"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="text-sm font-medium text-foreground">
                Ver más reseñas en Google Maps
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-muted shrink-0"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
