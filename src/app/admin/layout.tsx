import type { Metadata } from "next"

/**
 * Deliberately bare: this layout only exists to keep the whole `/admin` subtree
 * out of search engines. The panel chrome (header, logout) lives in
 * `(panel)/layout.tsx` so the login screen doesn't inherit it.
 */
export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children
}
