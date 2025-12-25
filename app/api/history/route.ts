import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    // Get userId from request headers (set by client)
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized - No user ID provided' 
      }, { status: 401 });
    }

    // Get user's analyses
    const { data, error } = await supabaseAdmin
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching history:', error);
      return NextResponse.json({ 
        error: 'Error fetching history' 
      }, { status: 500 });
    }

    // Parse analysis_data from JSON string to object
    const analyses = data.map(item => ({
      ...item,
      analysis_data: typeof item.analysis_data === 'string' 
        ? JSON.parse(item.analysis_data) 
        : item.analysis_data
    }));

    return NextResponse.json({ 
      success: true,
      analyses 
    });

  } catch (error: any) {
    console.error('History API error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}