import { Link } from "@tanstack/react-router";
import { categoryBySlug, formatDate, readingTime } from "../../lib/site";
import type { Post } from "../../lib/seed-types";

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const cat = categoryBySlug(post.category);
  const img = post.cover_image || cat.image;
  return (
    <article className={`card group overflow-hidden transition-shadow hover:shadow-[0_12px_40px_-12px_rgba(28,27,31,0.25)] ${featured ? "md:col-span-2 md:grid md:grid-cols-2" : ""}`}>
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
        <img
          src={img}
          alt={post.title}
          loading="lazy"
          width={800}
          height={450}
          className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] ${featured ? "aspect-[4/3] md:h-full" : "aspect-[16/9]"}`}
        />
      </Link>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/kategorie/$slug" params={{ slug: cat.slug }} className="tag hover:bg-wald hover:text-white">
            {cat.name}
          </Link>
          {post.premium === 1 && <span className="tag tag-rot">Premium</span>}
          {post.is_news === 1 && <span className="tag bg-gold/20 text-ink">Wien-News</span>}
          {post.ai_generated === 1 && <span className="tag bg-ink/5 text-ink">KI</span>}
        </div>
        <h3 className={featured ? "text-2xl" : "text-xl"}>
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:text-rot">
            {post.title}
          </Link>
        </h3>
        <p className="text-sm text-ink-2">{post.excerpt}</p>
        <p className="mt-auto text-xs text-ink-3">
          {post.author_name}
          {post.company ? ` · ${post.company}` : ""} · {formatDate(post.published_at)} · {readingTime(post.content)} Min. Lesezeit
        </p>
      </div>
    </article>
  );
}
