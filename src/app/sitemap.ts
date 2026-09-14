import type { MetadataRoute } from "next";
import { projectContentRepository } from "@/features/projectContent/repository";
import { unitContentRepository } from "@/features/unitContent/repository";
import { newsArticles } from "@/content/news";
import { constructionProgress } from "@/content/construction";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = [
  "",
  "/about",
  "/projects",
  "/properties",
  "/services",
  "/construction",
  "/landowners",
  "/gallery",
  "/news",
  "/contact",
  "/policy",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/cookies",
  "/sitemap",
];

/** Real routes only — every dynamic slug comes straight from the same content the pages themselves render from, so this can never list a page that 404s. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, units] = await Promise.all([projectContentRepository.list(), unitContentRepository.list()]);

  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const projectEntries = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const constructionEntries = constructionProgress
    .filter((p) => projects.some((project) => project.slug === p.projectSlug))
    .map((p) => ({
      url: `${siteUrl}/projects/${p.projectSlug}/construction`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const unitEntries = units
    .filter((unit) => projects.some((project) => project.slug === unit.projectSlug))
    .map((unit) => ({
      url: `${siteUrl}/projects/${unit.projectSlug}/units/${unit.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const newsEntries = newsArticles.map((article) => ({
    url: `${siteUrl}/news/${article.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...projectEntries, ...constructionEntries, ...unitEntries, ...newsEntries];
}
