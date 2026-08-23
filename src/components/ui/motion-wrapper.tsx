"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import { fadeUp, staggerContainer } from "@/lib/animations"

interface RevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
}

export function Reveal({ children, className, ...props }: RevealProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerGroup({ children, className, ...props }: RevealProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
