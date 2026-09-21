import type { MetadataRoute } from "next";

// Served as /sitemap.xml. Only the sign-in page is public; every clinic page
// sits behind middleware, so listing patient URLs here would be pointless (and
// would leak record IDs).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [{ url: `${base}/login`, changeFrequency: "yearly", priority: 1 }];
}
