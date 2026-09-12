import type {
  AppointmentExtras,
  BookableService,
  GroupOption,
  Service,
  Package,
  ServiceTotals,
} from "@/types"

export const services: Service[] = [
  {
    id: "corte-clasico",
    name: "Corte clásico",
    description:
      "El corte de siempre, ejecutado con la precisión de más de tres décadas de oficio. Tijera y máquina en perfecta armonía.",
    duration: "40–50 min",
    price: "$279",
    durationMin: 60,
    priceMxn: 279,
    firstVisitPriceMxn: 229,
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
    firstVisitPriceMxn: 229,
    image: "/images/placeholder-fade.jpg",
  },
  {
    id: "corte-tijera",
    name: "Corte con tijera",
    description:
      "Para quienes prefieren un acabado con más textura y movimiento natural. Ideal para cabello largo o medio.",
    duration: "40–50 min",
    price: "$279",
    durationMin: 60,
    priceMxn: 279,
    firstVisitPriceMxn: 229,
    image: "/images/placeholder-tijera.jpg",
  },
  {
    id: "barba",
    name: "Barba",
    description:
      "Perfilado, recorte y definición de barba con navaja y tijera. Líneas limpias, acabado impecable.",
    duration: "30–40 min",
    price: "$249",
    durationMin: 45,
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
    durationMin: 60,
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
  },
  {
    id: "padre-hijo",
    name: "Padre e hijo",
    description:
      "Un corte de adulto y uno de niño en la misma visita. Ideal para compartir el momento.",
    price: "$449",
  },
  {
    id: "amigos",
    name: "Amigos",
    description:
      "Dos cortes de adulto en el mismo domicilio, en una sola visita.",
    price: "$499",
  },
]

/**
 * The base service picked in the panel. The landing's packages are deliberately
 * absent: "Corte + Barba", "Padre e hijo" and "Amigos" are combinations of a
 * base service plus the options below, which also cover what a fixed list never
 * could — a fade for two friends, one of them with beard. Offering both would
 * let the barber charge the beard twice.
 */
export const bookableServices: BookableService[] = services.map(
  ({ id, name, durationMin, priceMxn, firstVisitPriceMxn }) => ({
    id,
    name,
    durationMin,
    priceMxn,
    firstVisitPriceMxn,
  })
)

export function findBookableService(id: string): BookableService | undefined {
  return bookableServices.find((service) => service.id === id)
}

/**
 * Beard on top of a haircut. Priced from the catalog rather than invented:
 * "Corte + Barba" is $449 and a cut alone is $279.
 */
export const BEARD_EXTRA = {
  durationMin: 45,
  priceMxn: 170,
} as const

/**
 * How many clients are served in one visit. Two people is a package with its own
 * negotiated price, not twice a haircut — that is why the price lives here and
 * replaces the service price instead of multiplying it.
 */
export const groupOptions: GroupOption[] = [
  { id: "solo", label: "1 persona", peopleCount: 1 },
  { id: "padre-hijo", label: "Padre e hijo", hint: "adulto y niño", peopleCount: 2, priceMxn: 449 },
  {
    id: "amigos",
    label: "Amigos",
    hint: "2 adultos",
    peopleCount: 2,
    priceMxn: 499,
    // The only package price Diego fixed by hand; the rest fall to the 20% rule.
    firstVisitPriceMxn: 449,
  },
]

export function findGroupOption(id: string): GroupOption | undefined {
  return groupOptions.find((option) => option.id === id)
}

/** First-visit discount for everything Diego has not priced explicitly. */
export const FIRST_VISIT_DISCOUNT = 0.2

/**
 * A hand-set first-visit price always wins; otherwise 20% off, rounded to whole
 * pesos because nobody pays cents in cash.
 */
function firstVisitPriceOf(priceMxn: number, override?: number): number {
  return override ?? Math.round(priceMxn * (1 - FIRST_VISIT_DISCOUNT))
}

/**
 * What actually gets reserved and charged. Lives here, next to the catalog, so
 * the server and the live preview in the form can never disagree.
 *
 * The beard is added once, not per person: two clients both wanting a beard is
 * rare enough that a note covers it, and a per-person checkbox grid would cost
 * more taps than it saves.
 */
export function resolveServiceTotals(
  service: BookableService,
  { groupId, withBeard, firstVisit }: AppointmentExtras
): ServiceTotals {
  const group = findGroupOption(groupId) ?? groupOptions[0]

  // A two-person package sets the whole price; on its own, the service does.
  const isPackage = group.priceMxn !== undefined
  const basePrice = group.priceMxn ?? service.priceMxn
  const baseOverride = isPackage ? group.firstVisitPriceMxn : service.firstVisitPriceMxn

  const beardPrice = firstVisit
    ? firstVisitPriceOf(BEARD_EXTRA.priceMxn)
    : BEARD_EXTRA.priceMxn

  return {
    name: describeService(service.name, { groupId, withBeard, firstVisit }),
    durationMin:
      service.durationMin * group.peopleCount + (withBeard ? BEARD_EXTRA.durationMin : 0),
    priceMxn:
      (firstVisit ? firstVisitPriceOf(basePrice, baseOverride) : basePrice) +
      (withBeard ? beardPrice : 0),
  }
}

/** Snapshot label stored on the appointment: it is what shows up in Calendar and WhatsApp. */
function describeService(
  name: string,
  { groupId, withBeard, firstVisit }: AppointmentExtras
): string {
  const group = findGroupOption(groupId)
  const parts = [withBeard ? `${name} + barba` : name]

  if (group && group.peopleCount > 1) {
    parts.push(group.label)
  }

  if (firstVisit) {
    parts.push("1ª cita")
  }

  return parts.join(" · ")
}

export const firstVisitPrice = {
  price: "$229",
  description: "Primera cita",
}
