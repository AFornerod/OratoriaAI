import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    // Por ahora traemos análisis anónimos (user_id null)
    // Después filtraremos por user
    const { data: analyses, error } = await supabaseAdmin
      .from('analyses')
      .select('*')
      .is('user_id', null) // Solo análisis sin usuario por ahora
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      analyses: analyses || [] 
    });

  } catch (error: any) {
    console.error('Fetch history error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}