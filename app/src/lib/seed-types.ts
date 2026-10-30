export type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image?: string;
  published_at: string;
  author_name?: string;
  author_email?: string;
  company?: string;
  website_url?: string;
  backlink?: number;
  premium?: number;
  is_news?: number;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author_name: string;
  author_email: string;
  company: string;
  website_url: string;
  backlink: number;
  premium: number;
  is_news: number;
  status: string;
  cover_image: string;
  views: number;
  created_at: string;
  published_at: string | null;
  ai_generated?: number;
};

export type Order = {
  id: string;
  post_id: number;
  amount_cents: number;
  currency: string;
  status: string;
  provider: string;
  customer_email: string;
  created_at: string;
  paid_at: string | null;
};
