import { getSupabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminEditArticleClient from '@/components/AdminEditArticleClient';

export default async function EditArticlePage({ 
  params 
}: { 
  params: Promise<{ lang: string; id: string }> 
}) {
  const { lang, id } = await params;
  
  // Security check
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin_session')?.value === 'true';
  if (!isAdmin) redirect(`/${lang}/admin`);

  const supabase = getSupabaseAdmin();
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (!article) notFound();

  return <AdminEditArticleClient article={article} lang={lang} />;
}
