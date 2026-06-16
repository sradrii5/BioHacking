import { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Dynamic Sitemap Generator for Biohacker Age
 * This file automatically informs Google about all our articles and legal pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.biohackerage.com';
  const supabase = getSupabaseAdmin();

  // 1. Static Pages
  const staticPages = [
    '',
    '/es',
    '/en',
    '/es/legal/privacy',
    '/es/legal/terms',
    '/es/legal/disclaimer',
    '/en/legal/privacy',
    '/en/legal/terms',
    '/en/legal/disclaimer',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' || route === '/es' || route === '/en' ? 1 : 0.5,
  }));

  // 2. Categories
  const categories = ['Protocolos', 'Recomendaciones', 'Ciencia'];
  const categoryEntries: MetadataRoute.Sitemap = [];
  
  ['es', 'en'].forEach(lang => {
    categories.forEach(cat => {
      categoryEntries.push({
        url: `${baseUrl}/${lang}?cat=${cat}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, created_at, seo_metadata')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const articleEntries: MetadataRoute.Sitemap = (articles || []).map((article) => {
    const lang = article.seo_metadata?.locale || 'es';
    return {
      url: `${baseUrl}/${lang}/${article.slug}`,
      lastModified: new Date(article.created_at),
      changeFrequency: 'monthly',
      priority: 0.7,
    };
  });

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
