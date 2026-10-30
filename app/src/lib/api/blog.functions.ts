import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { countPublished, getImpressum, getPublishedBySlug, listLatest, listPublished } from "../db.server";

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const [latest, news, total, impressum] = await Promise.all([
    listLatest(6),
    listPublished({ news: true, limit: 3 }),
    countPublished(),
    getImpressum(),
  ]);
  return { latest, news, total, mapQuery: impressum.mapQuery, city: impressum.city };
});

export const getBlogPage = createServerFn({ method: "GET" })
  .inputValidator(z.object({ category: z.string().optional(), page: z.number().int().min(1).default(1) }))
  .handler(async ({ data }) => {
    const pageSize = 12;
    const posts = await listPublished({ category: data.category, limit: pageSize + 1, offset: (data.page - 1) * pageSize });
    const hasMore = posts.length > pageSize;
    return { posts: posts.slice(0, pageSize), hasMore, page: data.page };
  });

export const getPost = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1).max(120) }))
  .handler(async ({ data }) => {
    const post = await getPublishedBySlug(data.slug);
    if (!post) return { post: null, related: [] };
    const related = (await listPublished({ category: post.category, limit: 4 })).filter((p) => p.slug !== post.slug).slice(0, 3);
    return { post, related };
  });

export const getImpressumData = createServerFn({ method: "GET" }).handler(async () => {
  return await getImpressum();
});
