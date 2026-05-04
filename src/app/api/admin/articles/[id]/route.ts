import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

/**
 * DELETE /api/admin/articles/[id]
 * Securely deletes an article from the database.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 1. Check session (Simple security check matching our login)
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // 2. Delete the article
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/articles/[id]
 * Updates an article's data.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();
    
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get('admin_session')?.value === 'true';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch current article to get existing metadata
    const { data: current } = await supabase
      .from('articles')
      .select('seo_metadata')
      .eq('id', id)
      .single();

    // 2. Prepare payload
    const { title, tl_dr, content, trust_score, category } = updates;
    const finalPayload: any = {
      title,
      tl_dr,
      content_html: content,
      trust_score,
    };

    // Merge category into metadata if provided
    if (category) {
      finalPayload.seo_metadata = {
        ...(current?.seo_metadata || {}),
        category
      };
    }

    const { data, error } = await supabase
      .from('articles')
      .update(finalPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
