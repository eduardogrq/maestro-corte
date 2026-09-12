export interface Service {
  id: string
  name: string
  description: string
  /** Display copy, e.g. "40–50 min" */
  duration: string
  /** Display copy, e.g. "$279" */
  price: string
  /** Minutes reserved when scheduling. Upper bound of `duration` on purpose. */
  durationMin: number
  priceMxn: number
  /** Placeholder image path — replace with real photography */
  image: string
}

export interface Package {
  id: string
  name: string
  description: string
  /** Display copy, e.g. "$449" */
  price: string
  durationMin: number
  priceMxn: number
}

/**
 * Uniform shape for anything that can be booked from the admin panel.
 * Flattens services and packages so the form only deals with one list.
 */
export interface BookableService {
  id: string
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
