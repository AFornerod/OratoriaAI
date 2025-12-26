import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getTierLimit } from '@/lib/tierLimits';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Obtener sesión del usuario
    const session = await getServerSession();
    let userId: string | null = null;
    let userTier = 'free';

    if (session?.user?.email) {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('id, tier')
        .eq('email', session.user.email)
        .single();

      if (profile) {
        userId = profile.id;
        userTier = profile.tier || 'free';
      }
    }

    // Verificar límites
    const limits = getTierLimit(userTier);
    const today = new Date().toISOString().split('T')[0];

    if (userId) {
      // Obtener contador de hoy
      const { data: countData } = await supabaseAdmin
        .from('daily_analysis_count')
        .select('count')
        .eq('user_id', userId)
        .eq('analysis_date', today)
        .single();

      const currentCount = countData?.count || 0;

      // Verificar si excedió el límite
      if (currentCount >= limits.dailyAnalyses) {
        return NextResponse.json({
          error: 'LIMIT_EXCEEDED',
          message: `Has alcanzado el límite de ${limits.dailyAnalyses} análisis por día para el plan ${limits.name}`,
          tier: userTier,
          limit: limits.dailyAnalyses
        }, { status: 429 });
      }
    }

    // Verificar tamaño del archivo
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (videoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'Video demasiado grande. El tamaño máximo es 20MB.' 
      }, { status: 400 });
    }

    console.log('📹 Video file:', {
      name: videoFile.name,
      type: videoFile.type,
      size: `${(videoFile.size / 1024 / 1024).toFixed(2)} MB`
    });

    // Convertir el archivo a base64
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Video = buffer.toString('base64');

    // Prompt para análisis completo
    const prompt = `Analiza este video de una presentación o discurso público y proporciona un análisis detallado en formato JSON con la siguiente estructura exacta:

{
  "overallScore": (número del 0-100),
  "summary": "Resumen general del desempeño en 2-3 oraciones",
  "fillerWords": [
    { "word": "palabra", "count": número }
  ],
  "pacing": {
    "status": "Lento" | "Normal" | "Rápido",
    "wpm": número estimado de palabras por minuto,
    "feedback": "retroalimentación sobre el ritmo"
  },
  "emotions": [
    { "name": "emoción", "percentage": número }
  ],
  "bodyLanguage": {
    "eyeContact": "Pobre" | "Bueno" | "Excelente",
    "posture": "Encorvado" | "Relajado" | "Tenso" | "Erguido",
    "gestures": "Limitados" | "Naturales" | "Excesivos",
    "feedback": "retroalimentación sobre lenguaje corporal"
  },
  "speechAnalysis": {
    "clarity": "Confuso" | "Claro" | "Muy Claro",
    "coherence": "Baja" | "Buena" | "Excelente",
    "persuasion": "Poco Convincente" | "Convincente" | "Muy Persuasivo",
    "feedback": "retroalimentación sobre el discurso"
  },
  "improvementTips": [
    "consejo 1",
    "consejo 2",
    "consejo 3"
  ],
  "actionPlan": {
    "exercises": ["ejercicio 1", "ejercicio 2"],
    "dynamics": ["dinámica 1", "dinámica 2"],
    "resources": ["recurso 1", "recurso 2"]
  }
}

IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON, sin texto adicional, sin explicaciones, sin markdown.`;

    // Preparar el payload para Gemini API
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: videoFile.type || 'video/webm',
                data: base64Video
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      }
    };

    console.log('🤖 Calling Gemini API with fetch...');

    // Llamar a Gemini API usando fetch directo
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('❌ Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('✅ Gemini response received');

    // Extraer el texto de la respuesta
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('❌ No text in Gemini response:', geminiData);
      throw new Error('No text content in Gemini response');
    }

    console.log('📝 Raw response length:', text.length);

    // Parsear la respuesta
    let analysisData;
    try {
      // Limpiar el texto de posibles markdown o texto adicional
      let cleanText = text.trim();
      
      // Remover bloques de código markdown si existen
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Remover cualquier texto antes del primer '{'
      const firstBrace = cleanText.indexOf('{');
      if (firstBrace > 0) {
        cleanText = cleanText.substring(firstBrace);
      }
      
      // Remover cualquier texto después del último '}'
      const lastBrace = cleanText.lastIndexOf('}');
      if (lastBrace !== -1 && lastBrace < cleanText.length - 1) {
        cleanText = cleanText.substring(0, lastBrace + 1);
      }
      
      analysisData = JSON.parse(cleanText);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ Error parsing Gemini response:', parseError);
      console.log('📄 Raw response:', text);
      return NextResponse.json({ 
        error: 'Failed to parse AI response',
        details: 'La respuesta del AI no pudo ser procesada correctamente',
        rawResponse: text.substring(0, 500)
      }, { status: 500 });
    }

    // Guardar en base de datos si hay usuario
    if (userId) {
      const { error: insertError } = await supabaseAdmin
        .from('analysis_history')
        .insert({
          user_id: userId,
          analysis_data: analysisData,
          video_duration: 0,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error saving analysis:', insertError);
      } else {
        console.log('✅ Analysis saved to database');
      }

      // Incrementar contador de análisis
      await supabaseAdmin.rpc('increment_analysis_count', {
        p_user_id: userId,
        p_date: today
      });
      
      console.log('✅ Analysis count incremented');
    }

    return NextResponse.json({ analysis: analysisData });
  } catch (error: any) {
    console.error('❌ Analysis error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze video',
        message: error.message || 'Error desconocido al analizar el video',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
