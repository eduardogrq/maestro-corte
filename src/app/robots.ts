import type { MetadataRoute } from "next"
import { business } from "@/data/business"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The panel is private. `noindex` on the admin layout is the real barrier;
      // this just keeps crawlers from knocking.
      disallow: "/admin",
    },
    sitemap: `${business.url}/sitemap.xml`,
  }
}
