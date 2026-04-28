import { NextResponse } from 'next/server';
import { AITransformerService } from '@/lib/services/ai-transformer';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { articleId } = await req.json();
    console.log('🔍 Generating social for article:', articleId);
    
    const supabase = getSupabaseAdmin();
    const transformer = new AITransformerService();

    // 1. Fetch article only
    const { data: article, error: aErr } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (aErr) {
      console.error('❌ Supabase error:', aErr.message);
      throw new Error(`DB Error: ${aErr.message}`);
    }
    
    if (!article) {
      console.error('❌ Article not found in DB for ID:', articleId);
      throw new Error('Article not found');
    }

    // 2. Prepare metadata
    const metadata = {
      title: article.title,
      tl_dr: article.tl_dr || 'Resumen científico sobre longevidad',
      key_benefits: [], 
      trust_score: article.trust_score || 80,
      product_keywords: []
    };

    // 3. Generate Social Posts
    const social = await transformer.generateSocialPosts(metadata as any, (article.seo_metadata as any)?.locale || 'es');

    // 4. Update Article
    const newSeoMetadata = {
      ...(article.seo_metadata as any),
      social
    };

    const { error: uErr } = await supabase
      .from('articles')
      .update({ seo_metadata: newSeoMetadata })
      .eq('id', articleId);

    if (uErr) throw uErr;

    return NextResponse.json({ success: true, social });

  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
