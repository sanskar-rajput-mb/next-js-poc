import type { MetadataRoute } from "next";

// Served as /robots.txt. Nothing in a clinic console should ever turn up in a
// search engine, so every crawler is turned away from every path.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
