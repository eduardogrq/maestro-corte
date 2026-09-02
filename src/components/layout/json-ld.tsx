import { business } from "@/data/business"
import { services } from "@/data/services"

export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    name: business.name,
    description: business.description,
    url: business.url,
    telephone: business.phone,
    priceRange: business.priceRange,
    // TODO: Add real logo URL once available
    image: `${business.url}/og-image.jpg`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "10:00",
        closes: "17:00",
      },
    ],
    areaServed: [
      {
        "@type": "City",
        name: "Ciudad de México",
      },
      {
        "@type": "AdministrativeArea",
        name: "Coyoacán, Ciudad de México",
      },
      {
        "@type": "AdministrativeArea",
        name: "Benito Juárez, Ciudad de México",
      },
    ],
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        // Approximate center of Coyoacán
        latitude: 19.35,
        longitude: -99.16,
      },
      geoRadius: "10000",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de barbería",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          description: service.description,
        },
      })),
    },
    sameAs: [
      `https://instagram.com/${business.instagram}`,
      business.facebookUrl,
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
