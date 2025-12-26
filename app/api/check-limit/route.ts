import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/supabase/server';

// 🆕 Límites mensuales por tier
const TIER_LIMITS = {
  free: 3,
  starter: 5,
  pro: 10,
  premium: 999999 // Prácticamente ilimitado
};

const VIDEO_DURATION_LIMITS = {
  free: 60,      // 1 minuto
  starter: 900,  // 15 minutos
  pro: 1800,     // 30 minutos
  premium: 3600  // 1 hora
};

export async function GET(req: NextRequest) {
  try {
    console.log('📊 [check-limit] Request received');
    
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      console.log('❌ [check-limit] No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('👤 [check-limit] User:', session.user.email);

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, tier')
      .eq('email', session.user.email)
      .single();

    if (profileError || !profile) {
      console.error('❌ [check-limit] Profile error:', profileError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tier = profile.tier || 'free';
    const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
    
    console.log('🎫 [check-limit] Tier:', tier, 'Limit:', limit);

    // 🆕 Obtener mes actual (YYYY-MM)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    console.log('📅 [check-limit] Current month:', currentMonth);

    // 🆕 Obtener contador mensual desde analysis_usage
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from('analysis_usage')
      .select('analysis_count')
      .eq('user_id', profile.id)
      .eq('analysis_month', currentMonth)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('❌ [check-limit] Usage error:', usageError);
    }

    const used = usageData?.analysis_count || 0;
    const remaining = tier === 'premium' ? 'unlimited' : Math.max(0, limit - used);
    const canAnalyze = tier === 'premium' || used < limit;

    console.log('📊 [check-limit] Used:', used, 'Remaining:', remaining, 'Can analyze:', canAnalyze);

    // Calcular fecha de reset (primer día del siguiente mes)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const resetsAt = nextMonth.toISOString();

    const response = {
      success: true, // 🆕 Agregar este campo
      tier,
      limit,
      used,
      remaining,
      canAnalyze,
      currentMonth,
      resetsAt,
      videoDurationLimit: VIDEO_DURATION_LIMITS[tier as keyof typeof VIDEO_DURATION_LIMITS]
    };

    console.log('✅ [check-limit] Response:', response);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ [check-limit] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check limits' },
      { status: 500 }
    );
  }
}
