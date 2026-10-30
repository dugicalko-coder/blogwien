// Auto-Redaktion: taeglich erzeugte KI-Beitraege (siehe AUTOPOST.md).
// Jede Datei src/content/auto/YYYY-MM-DD.json ist ein Batch und wird einmalig in D1 uebernommen.
// published_at liegt in UTC und darf in der Zukunft liegen: der Beitrag wird erst ab diesem Zeitpunkt sichtbar.
import type { SeedPost } from "./seed-types";

const modules = import.meta.glob("../content/auto/*.json", { eager: true, import: "default" }) as Record<string, SeedPost[]>;

export const AUTO_BATCHES: { id: string; posts: SeedPost[] }[] = Object.entries(modules)
  .map(([path, posts]) => ({ id: (path.split("/").pop() ?? path).replace(/\.json$/, ""), posts: Array.isArray(posts) ? posts : [] }))
  .sort((a, b) => a.id.localeCompare(b.id));
