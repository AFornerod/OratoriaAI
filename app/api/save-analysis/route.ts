import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysis, topic, goal, language, tier = 'free', userId = null } = body;


    // Por ahora sin user_id (lo agregaremos con auth)
    // Guardamos análisis anónimo

    const { data, error } = await supabaseAdmin
      .from('analyses')
      .insert({
        user_id: userId, // Temporal - luego será el user ID real
        overall_score: analysis.overallScore,
        summary: analysis.summary,
        analysis_data: analysis, // Todo el objeto como JSONB
        topic,
        goal,
        tier,
        language,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving analysis:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      analysisId: data.id 
    });

  } catch (error: any) {
    console.error('Save analysis error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}