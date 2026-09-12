export interface Service {
  id: string
  name: string
  description: string
  /** Display copy, e.g. "40–50 min" */
  duration: string
  /** Display copy, e.g. "$279" */
  price: string
  /**
   * Minutes the panel actually blocks off, deliberately more generous than the
   * public `duration` copy: a haircut advertised as "40–50 min" is booked as a
   * full hour so arriving, setting up and cleaning up don't eat the next slot.
   */
  durationMin: number
  priceMxn: number
  /**
   * Hand-set first-visit price. Only for the adult haircuts Diego quotes at
   * $229; everything else falls to the 20% rule in `resolveServiceTotals`.
   */
  firstVisitPriceMxn?: number
  /** Placeholder image path — replace with real photography */
  image: string
}

/**
 * Landing-page copy only. Packages are no longer bookable units in the panel —
 * the beard and people options compose the same combos and more.
 */
export interface Package {
  id: string
  name: string
  description: string
  /** Display copy, e.g. "$449" */
  price: string
}

/**
 * The base service picked in the admin panel, before extras are applied.
 */
export interface BookableService {
  id: string
  name: string
  durationMin: number
  priceMxn: number
  firstVisitPriceMxn?: number
}

/** How many clients share one visit, and what that visit costs as a package. */
export interface GroupOption {
  id: string
  label: string
  /** Shown next to the label, e.g. "2 adultos". */
  hint?: string
  peopleCount: number
  /** Package price, replacing the base service price. Absent for a single client. */
  priceMxn?: number
  firstVisitPriceMxn?: number
}

/** The variations on a base service the barber picks in the panel. */
export interface AppointmentExtras {
  /** Id of a `GroupOption`. */
  groupId: string
  /** Beard trim on top of the haircut. */
  withBeard: boolean
  /** First visit for this client: applies the introductory price. */
  firstVisit: boolean
}

/** Base service plus extras, resolved into what gets reserved, charged and shown. */
export interface ServiceTotals {
  name: string
  durationMin: number
  priceMxn: number
}

export interface Testimonial {
  id: string
  name: string
  location: string
  text: string
  service: string
}

export interface ProcessStep {
  number: number
  title: string
  description: string
}

export interface Zone {
  name: string
  slug: string
  description: string
}
