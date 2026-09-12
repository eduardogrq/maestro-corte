import type { BookableService, Service, Package } from "@/types"

export const services: Service[] = [
  {
    id: "corte-clasico",
    name: "Corte clásico",
    description:
      "El corte de siempre, ejecutado con la precisión de más de tres décadas de oficio. Tijera y máquina en perfecta armonía.",
    duration: "40–50 min",
    price: "$279",
    durationMin: 50,
    priceMxn: 279,
    image: "/images/placeholder-corte-clasico.jpg",
  },
  {
    id: "fade",
    name: "Fade / Desvanecido",
    description:
      "Degradado limpio y definido. Low, mid o high fade adaptado a tu estilo y tipo de cabello.",
    duration: "50–60 min",
    price: "$279",
    durationMin: 60,
    priceMxn: 279,
    image: "/images/placeholder-fade.jpg",
  },
  {
    id: "corte-tijera",
    name: "Corte con tijera",
    description:
      "Para quienes prefieren un acabado con más textura y movimiento natural. Ideal para cabello largo o medio.",
    duration: "40–50 min",
    price: "$279",
    durationMin: 50,
    priceMxn: 279,
    image: "/images/placeholder-tijera.jpg",
  },
  {
    id: "barba",
    name: "Barba",
    description:
      "Perfilado, recorte y definición de barba con navaja y tijera. Líneas limpias, acabado impecable.",
    duration: "30–40 min",
    price: "$249",
    durationMin: 40,
    priceMxn: 249,
    image: "/images/placeholder-barba.jpg",
  },
  {
    id: "barba-express",
    name: "Barba express",
    description:
      "Recorte rápido y perfilado de barba para mantenerla en forma entre visitas. Práctico y sin complicaciones.",
    duration: "20–30 min",
    price: "$199",
    durationMin: 30,
    priceMxn: 199,
    image: "/images/placeholder-barba-express.jpg",
  },
  {
    id: "ninos",
    name: "Corte para niños",
    description:
      "Paciencia y experiencia para los más pequeños. En la comodidad de tu casa, sin las distracciones de una barbería.",
    duration: "40–50 min",
    price: "$229",
    durationMin: 50,
    priceMxn: 229,
    image: "/images/placeholder-ninos.jpg",
  },
]

export const packages: Package[] = [
  {
    id: "corte-barba",
    name: "Corte + Barba",
    description: "Corte de cabello completo más perfilado y definición de barba.",
    price: "$449",
    durationMin: 90,
    priceMxn: 449,
  },
  {
    id: "padre-hijo",
    name: "Padre e hijo",
    description: "Dos cortes en una sola visita. Ideal para compartir el momento.",
    price: "$449",
    durationMin: 100,
    priceMxn: 449,
  },
]

/**
 * Everything bookable from the admin panel, services and packages alike.
 * Packages are real bookings too ("Corte + Barba" is a single visit).
 */
export const bookableServices: BookableService[] = [
  ...services.map(({ id, name, durationMin, priceMxn }) => ({
    id,
    name,
    durationMin,
    priceMxn,
  })),
  ...packages.map(({ id, name, durationMin, priceMxn }) => ({
    id,
    name,
    durationMin,
    priceMxn,
  })),
]

export function findBookableService(id: string): BookableService | undefined {
  return bookableServices.find((service) => service.id === id)
}

export const firstVisitPrice = {
  price: "$229",
  description: "Primera cita",
}
