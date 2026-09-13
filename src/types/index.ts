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
   * Welcome price for a client's first visit. Required, not derived from a
   * discount: adding a service must force an explicit decision, because this
   * number is what the client reads in the WhatsApp confirmation.
   */
  firstVisitPriceMxn: number
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
  firstVisitPriceMxn: number
}

/**
 * A client the barber has visited before, as remembered by his own appointments.
 * There is no clients table: the appointment history *is* the client list, so
 * recognising a returning client costs no extra bookkeeping at all.
 */
export interface ClientSuggestion {
  clientName: string
  /** Canonical `52##########`, ready to drop straight into the form. */
  clientPhone: string
  /** Null only for appointments saved before the address became required. */
  address: string | null
  /** Wall-clock date of the last visit, "YYYY-MM-DD", so he can see how long ago. */
  lastVisitDate: string
}

/** How many clients share one visit, and what that visit costs as a package. */
export interface GroupOption {
  id: string
  label: string
  /** Shown next to the label, e.g. "2 adultos". */
  hint?: string
  peopleCount: number
  /**
   * Package price, replacing the base service price. Absent for a single client.
   * Both prices travel together so a package can never be half-priced.
   */
  price?: {
    regularMxn: number
    firstVisitMxn: number
  }
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
