import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/gallery", "/about", "/course", "/reviews", "/costumes"];
  const base: MetadataRoute.Sitemap = routes.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("projects")
    .select("slug,updated_at")
    .eq("published", true);

  const projects: MetadataRoute.Sitemap = (data ?? []).map((p) => ({
    url: `${SITE_URL}/gallery/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...base, ...projects];
}
