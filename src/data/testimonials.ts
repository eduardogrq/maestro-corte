import type { Testimonial } from "@/types"

/**
 * MOCK DATA — Replace with real testimonials.
 * Do NOT use these in structured data or generate fake reviews for Google.
 */
export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Carlos M.",
    location: "Coyoacán",
    text: "Llevo más de dos años agendando con Diego. La comodidad de no salir de casa y la calidad del corte no tienen comparación. Siempre puntual, siempre impecable.",
    service: "Fade",
  },
  {
    id: "2",
    name: "Roberto L.",
    location: "Benito Juárez",
    text: "Probé varias barberías antes de encontrar a Diego. La experiencia se nota desde el primer corte. Mis hijos también se cortan con él y no hay drama.",
    service: "Corte clásico",
  },
  {
    id: "3",
    name: "Andrés P.",
    location: "Coyoacán",
    text: "El servicio a domicilio me ahorra más de una hora entre traslado y espera. Diego llega, prepara su espacio y en 40 minutos ya estoy listo.",
    service: "Corte con tijera",
  },
  {
    id: "4",
    name: "Fernando G.",
    location: "Del Valle",
    text: "Me recomendaron a Maestro Corte y desde la primera visita me quedé. La atención es muy personal y el resultado siempre consistente.",
    service: "Barba",
  },
]
