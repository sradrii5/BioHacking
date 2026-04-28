import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase.from('studies').select('count', { count: 'exact', head: true });
    
    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Connection to Supabase successful',
      count: data 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
