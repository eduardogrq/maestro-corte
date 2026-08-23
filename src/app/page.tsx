import { Hero } from "@/components/sections/hero"
import { Experience } from "@/components/sections/experience"
import { Services } from "@/components/sections/services"
import { Process } from "@/components/sections/process"
import { Zones } from "@/components/sections/zones"
import { Testimonials } from "@/components/sections/testimonials"
import { CtaFinal } from "@/components/sections/cta-final"

export default function HomePage() {
  return (
    <>
      <Hero />
      <Experience />
      <Services />
      <Process />
      <Zones />
      <Testimonials />
      <CtaFinal />
    </>
  )
}
