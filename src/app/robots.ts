import type { MetadataRoute } from "next"
import { business } from "@/data/business"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The panel is private, and each `/cita/...` link belongs to one client.
      // `noindex` on those pages is the real barrier; this just keeps crawlers
      // from knocking.
      disallow: ["/admin", "/cita"],
    },
    sitemap: `${business.url}/sitemap.xml`,
  }
}
