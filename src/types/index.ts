export interface Service {
  id: string
  name: string
  description: string
  duration: string
  /** Placeholder image path — replace with real photography */
  image: string
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
