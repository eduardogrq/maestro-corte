import type { MetadataRoute } from "next"
import { business } from "@/data/business"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: business.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // Future pages — uncomment as they are created:
    // {
    //   url: `${business.url}/barberia-a-domicilio-coyoacan`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // {
    //   url: `${business.url}/barberia-a-domicilio-benito-juarez`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
  ]
}
