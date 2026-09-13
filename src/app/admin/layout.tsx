import type { Metadata } from "next"

/**
 * Deliberately bare: this layout only exists to keep the whole `/admin` subtree
 * out of search engines. The panel chrome (header, logout) lives in
 * `(panel)/layout.tsx` so the login screen doesn't inherit it.
 */
export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false, nocache: true },
  // Only the panel is installable. `app/manifest.ts` would be global and make
  // the public landing installable too, so the manifest is a static file linked
  // from this segment. It lives outside `/admin` on purpose: `proxy.ts` matches
  // `/admin/:path*`, and a manifest redirected to the login screen never parses.
  // No service worker by design — caching an authenticated panel would show
  // Diego stale appointments.
  manifest: "/panel.webmanifest",
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children
}
