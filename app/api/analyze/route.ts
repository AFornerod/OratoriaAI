// app/api/analyze/route.ts
// API endpoint para analizar videos con IA (sistema de límites MENSUALES)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { analyzeVideo } from '@/lib/gemini/service';

// ========================================
// LÍMITES MENSUALES POR TIER
// ========================================
const TIER_LIMITS = {
  free: 3,
  starter: 5,
  pro: 10,
  premium: 999999, // Ilimitado
};

// Límites de duración de video (en segundos)
const VIDEO_DURATION_LIMITS = {
  free: 60,      // 1 minuto
  starter: 900,  // 15 minutos
  pro: 1800,     // 30 minutos
  premium: 3600, // 1 hora
};

// ========================================
// FUNCIÓN PARA VERIFICAR E INCREMENTAR USO MENSUAL
// ========================================
async function checkAndIncrementUsage(
  userId: string, 
  tier: string
): Promise<{ canProceed: boolean; remaining: number }> {
  // Obtener mes actual en formato YYYY-MM
  const currentMonth = new Date().toISOString().slice(0, 7); // "2025-12"

  // Obtener conteo actual del mes
  const { data: usage, error: fetchError } = await supabaseAdmin
    .from('analysis_usage')
    .select('analysis_count')
    .eq('user_id', userId)
    .eq('analysis_month', currentMonth)
    .single();

  const currentCount = usage?.analysis_count || 0;
  const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
  
  // Verificar si puede hacer más análisis este mes
  if (currentCount >= limit && limit !== 999999) {
    return { canProceed: false, remaining: 0 };
  }

  // Incrementar contador (upsert)
  if (usage) {
    // Actualizar registro existente
    const { error: updateError } = await supabaseAdmin
      .from('analysis_usage')
      .update({ 
        analysis_count: currentCount + 1,
        tier: tier,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('analysis_month', currentMonth);

    if (updateError) {
      console.error('Error updating usage:', updateError);
      throw new Error('Error al actualizar contador');
    }
  } else {
    // Crear nuevo registro para este mes
    const { error: insertError } = await supabaseAdmin
      .from('analysis_usage')
      .insert({
        user_id: userId,
        analysis_month: currentMonth,
        analysis_count: 1,
        tier: tier,
      });

    if (insertError) {
      console.error('Error inserting usage:', insertError);
      throw new Error('Error al crear contador');
    }
  }

  const remaining = limit === 999999 ? 999999 : limit - (currentCount + 1);
  return { canProceed: true, remaining };
}

// ========================================
// ENDPOINT POST - ANÁLISIS DE VIDEO
// ========================================
export async function POST(request: NextRequest) {
  try {
    console.log('📹 Video analysis request received');

    // 1. VERIFICAR SESIÓN
    const session = await getServerSession();

    if (!session?.user?.email) {
      console.log('❌ Unauthorized: No session');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log(`👤 User: ${session.user.email}`);

    // 2. OBTENER PERFIL DEL USUARIO
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, tier, name, email')
      .eq('email', session.user.email)
      .single();

    if (profileError || !profile) {
      console.log('❌ User profile not found');
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const userId = profile.id;
    const tier = profile.tier || 'free';

    console.log(`🎫 User tier: ${tier}`);

    // 3. VERIFICAR LÍMITES MENSUALES
    try {
      const { canProceed, remaining } = await checkAndIncrementUsage(userId, tier);
      
      if (!canProceed) {
        console.log(`❌ Monthly limit reached for tier: ${tier}`);
        const currentMonth = new Date().toISOString().slice(0, 7);
        const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
        const resetDate = nextMonth.toLocaleDateString('es-ES', { month: 'long', day: 'numeric' });
        
        return NextResponse.json(
          { 
            error: 'Límite de análisis mensuales alcanzado',
            tier,
            currentMonth,
            message: `Has alcanzado el límite de ${TIER_LIMITS[tier as keyof typeof TIER_LIMITS]} análisis mensuales para tu plan ${tier}. El límite se reiniciará el ${resetDate}. Mejora tu plan para obtener más análisis.`
          },
          { status: 429 } // Too Many Requests
        );
      }

      console.log(`✅ Analysis approved. Remaining this month: ${remaining}`);
    } catch (error) {
      console.error('Error checking usage limits:', error);
      return NextResponse.json(
        { error: 'Error al verificar límites de uso' },
        { status: 500 }
      );
    }

    // 4. OBTENER DATOS DEL REQUEST
    const body = await request.json();
    const { 
      videoBase64, 
      mimeType, 
      language = 'es',
      topic,
      audience,
      goal,
      videoDuration
    } = body;

    if (!videoBase64 || !mimeType) {
      console.log('❌ Missing video data');
      return NextResponse.json(
        { error: 'Falta el video o el tipo de archivo' },
        { status: 400 }
      );
    }

    // 5. VERIFICAR DURACIÓN DEL VIDEO
    const maxDuration = VIDEO_DURATION_LIMITS[tier as keyof typeof VIDEO_DURATION_LIMITS] || VIDEO_DURATION_LIMITS.free;
    
    if (videoDuration && videoDuration > maxDuration) {
      console.log(`❌ Video too long: ${videoDuration}s > ${maxDuration}s`);
      return NextResponse.json(
        { 
          error: 'Video demasiado largo',
          message: `Tu plan ${tier} permite videos de hasta ${maxDuration / 60} minuto(s). Este video dura ${Math.ceil(videoDuration / 60)} minuto(s).`
        },
        { status: 400 }
      );
    }

    console.log(`🎬 Video duration: ${videoDuration}s (limit: ${maxDuration}s)`);
    console.log(`🌐 Language: ${language}`);
    if (topic) console.log(`📝 Topic: ${topic}`);
    if (audience) console.log(`👥 Audience: ${audience}`);
    if (goal) console.log(`🎯 Goal: ${goal}`);

    // 6. ANALIZAR VIDEO CON GEMINI AI
    console.log('🤖 Calling Gemini API...');
    
    const analysisResult = await analyzeVideo({
      videoBase64,
      mimeType,
      language,
      topic,
      audience,
      goal,
    });

    console.log('✅ Gemini analysis completed');

    // 7. GUARDAR ANÁLISIS EN BASE DE DATOS (opcional)
    try {
      const { error: saveError } = await supabaseAdmin
        .from('analysis_history')
        .insert({
          user_id: userId,
          video_duration: videoDuration,
          language,
          topic,
          audience,
          goal,
          analysis_result: analysisResult,
          tier_at_analysis: tier,
          created_at: new Date().toISOString(),
        });

      if (saveError) {
        console.error('⚠️ Error saving to history:', saveError);
        // No fallar la request si falla el guardado en historial
      } else {
        console.log('💾 Analysis saved to history');
      }
    } catch (saveError) {
      console.error('⚠️ Error saving to history:', saveError);
      // Continuar aunque falle el guardado
    }

    // 8. RETORNAR RESULTADO
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      usage: {
        tier,
        remainingThisMonth: await getRemainingAnalyses(userId, tier),
      },
    });

  } catch (error: any) {
    console.error('❌ Analysis error:', error);
    
    // Manejar errores específicos de Gemini
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'Servicio temporalmente no disponible',
          message: 'El servicio de análisis está experimentando alta demanda. Por favor intenta nuevamente en unos minutos.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al analizar el video',
        message: error.message || 'Ocurrió un error inesperado. Por favor intenta nuevamente.'
      },
      { status: 500 }
    );
  }
}

// ========================================
// FUNCIÓN HELPER PARA OBTENER ANÁLISIS RESTANTES
// ========================================
async function getRemainingAnalyses(userId: string, tier: string): Promise<number | string> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const { data: usage } = await supabaseAdmin
    .from('analysis_usage')
    .select('analysis_count')
    .eq('user_id', userId)
    .eq('analysis_month', currentMonth)
    .single();

  const currentCount = usage?.analysis_count || 0;
  const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
  
  if (limit === 999999) return 'unlimited';
  
  return Math.max(0, limit - currentCount);
}
