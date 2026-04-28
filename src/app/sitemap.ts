import { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseAdmin();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Fetch all articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, created_at, seo_metadata')
    .eq('status', 'published');

  const articleEntries: MetadataRoute.Sitemap = (articles || []).map((article) => {
    const lang = article.seo_metadata?.locale || 'es';
    return {
      url: `${baseUrl}/${lang}/${article.slug}`,
      lastModified: new Date(article.created_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    };
  });

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/es`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  return [...staticPages, ...articleEntries];
}
