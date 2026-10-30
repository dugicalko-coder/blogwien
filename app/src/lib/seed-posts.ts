import type { Post, SeedPost } from "./seed-types";
import { SEED_1 } from "./seed-posts-1";
import { SEED_2 } from "./seed-posts-2";
import { SEED_3 } from "./seed-posts-3";
import { SEED_4 } from "./seed-posts-4";

export const SEED_POSTS: SeedPost[] = [...SEED_1, ...SEED_2, ...SEED_3, ...SEED_4];

// Fallback-Ansicht der Seed-Beitraege, falls die Datenbank (noch) nicht erreichbar ist.
export const SEED_AS_POSTS: Post[] = SEED_POSTS.map((p, i) => ({
  id: 1000 + i,
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  content: p.content,
  category: p.category,
  author_name: p.author_name ?? "Redaktion BlogWien",
  author_email: p.author_email ?? "",
  company: p.company ?? "",
  website_url: p.website_url ?? "",
  backlink: p.backlink ?? 0,
  premium: p.premium ?? (p.backlink ? 1 : 0),
  is_news: p.is_news ?? 0,
  status: "published",
  cover_image: p.cover_image ?? "",
  views: 0,
  created_at: p.published_at,
  published_at: p.published_at,
}));
