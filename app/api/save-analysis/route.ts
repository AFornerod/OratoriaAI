import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysis, topic, goal, language, tier = 'free', userId = null } = body;

    console.log('💾 [save-analysis] Saving analysis for user:', userId);

    // 1️⃣ Guardar el análisis en la tabla 'analyses'
    const { data: savedAnalysis, error: saveError } = await supabaseAdmin
      .from('analyses')
      .insert({
        user_id: userId,
        overall_score: analysis.overallScore,
        summary: analysis.summary,
        analysis_data: analysis,
        topic,
        goal,
        tier,
        language,
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ [save-analysis] Error saving analysis:', saveError);
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    console.log('✅ [save-analysis] Analysis saved with ID:', savedAnalysis.id);

    // 🆕 2️⃣ Incrementar contadores SOLO si hay userId
    if (userId) {
      console.log('📊 [save-analysis] Incrementing usage counters...');

      // Obtener mes y fecha actuales
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

      console.log('📅 [save-analysis] Current month:', currentMonth);
      console.log('📅 [save-analysis] Current date:', currentDate);

      // 🆕 A) Incrementar/Crear en analysis_usage (contador mensual)
      const { data: existingUsage } = await supabaseAdmin
        .from('analysis_usage')
        .select('analysis_count')
        .eq('user_id', userId)
        .eq('analysis_month', currentMonth)
        .single();

      const newCount = (existingUsage?.analysis_count || 0) + 1;

      const { error: usageError } = await supabaseAdmin
        .from('analysis_usage')
        .upsert({
          user_id: userId,
          analysis_month: currentMonth,
          analysis_count: newCount,
          tier: tier,
        }, {
          onConflict: 'user_id,analysis_month'
        });

      if (usageError) {
        console.error('⚠️ [save-analysis] Error updating analysis_usage:', usageError);
      } else {
        console.log('✅ [save-analysis] analysis_usage updated:', newCount);
      }

      // 🆕 B) Incrementar/Crear en daily_analysis_count (contador diario)
      const { data: existingDaily } = await supabaseAdmin
        .from('daily_analysis_count')
        .select('count')
        .eq('user_id', userId)
        .eq('analysis_date', currentDate)
        .single();

      const newDailyCount = (existingDaily?.count || 0) + 1;

      const { error: dailyError } = await supabaseAdmin
        .from('daily_analysis_count')
        .upsert({
          user_id: userId,
          analysis_date: currentDate,
          count: newDailyCount,
        }, {
          onConflict: 'user_id,analysis_date'
        });

      if (dailyError) {
        console.error('⚠️ [save-analysis] Error updating daily_analysis_count:', dailyError);
      } else {
        console.log('✅ [save-analysis] daily_analysis_count updated:', newDailyCount);
      }

      // 🆕 C) Actualizar user_profiles.analyses_used_this_month
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('analyses_used_this_month, last_reset_date')
        .eq('id', userId)
        .single();

      if (profile) {
        // Verificar si necesitamos resetear el contador
        const lastReset = profile.last_reset_date ? new Date(profile.last_reset_date) : null;
        const needsReset = !lastReset || 
          lastReset.getMonth() !== now.getMonth() || 
          lastReset.getFullYear() !== now.getFullYear();

        const currentUsed = needsReset ? 0 : (profile.analyses_used_this_month || 0);
        const newUsed = currentUsed + 1;

        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .update({
            analyses_used_this_month: newUsed,
            last_reset_date: needsReset ? now.toISOString() : profile.last_reset_date,
          })
          .eq('id', userId);

        if (profileError) {
          console.error('⚠️ [save-analysis] Error updating user_profiles:', profileError);
        } else {
          console.log('✅ [save-analysis] user_profiles updated:', newUsed);
        }
      }

      console.log('🎉 [save-analysis] All counters incremented successfully');
    } else {
      console.log('⏭️ [save-analysis] No userId - skipping counter increments');
    }

    return NextResponse.json({ 
      success: true, 
      analysisId: savedAnalysis.id 
    });

  } catch (error: any) {
    console.error('❌ [save-analysis] Error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
