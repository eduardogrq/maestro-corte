export const business = {
  name: "Maestro Corte by Diego",
  shortName: "Maestro Corte",
  tagline: "Barbería profesional a domicilio en Ciudad de México",
  description:
    "Servicio profesional de barbería y corte de cabello para caballero a domicilio en Ciudad de México. Más de 35 años de experiencia en Coyoacán y Benito Juárez.",
  yearsExperience: 35,
  since: 1990,
  owner: "Diego",

  phone: "+525640510011",
  whatsapp: {
    number: "525640510011",
    message:
      "Hola, vi su página de Maestro Corte y me gustaría agendar un corte a domicilio.",
  },

  googleMapsUrl: "https://maps.app.goo.gl/ggBziUbLmXo2n95i7",

  instagram: "maestro.corte.diego",
  facebook: "Maestro Corte by Diego",
  facebookUrl: "https://www.facebook.com/profile.php?id=61593187415112",

  // TODO: Replace with real URL once deployed
  url: "https://maestrocorte.mx",

  openingHours: {
    schedule: [
      { days: "Lunes a Sábado", hours: "9:00 – 21:00" },
      { days: "Domingo", hours: "9:00 – 19:00" },
    ],
    iso: ["Mo-Sa 09:00-21:00", "Su 09:00-19:00"],
  },

  // TODO: Replace with real price range
  priceRange: "$$",

  location: {
    city: "Ciudad de México",
    areas: ["Coyoacán", "Benito Juárez"],
    serviceArea: "CDMX sur",
  },
} as const

export function getWhatsAppUrl(): string {
  const { number, message } = business.whatsapp
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
