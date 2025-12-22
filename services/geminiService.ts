import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from "../types";

// Schema definition for the analysis result
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "Score from 0 to 100 based on public speaking best practices." },
    summary: { type: Type.STRING, description: "A brief, encouraging summary of the performance." },
    fillerWords: {
      type: Type.ARRAY,
      description: "List of detected filler words.",
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          count: { type: Type.NUMBER }
        }
      }
    },
    pacing: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, enum: ["Lento", "Normal", "Rápido"] },
        wpm: { type: Type.NUMBER, description: "Estimated words per minute." },
        feedback: { type: Type.STRING, description: "Feedback on the speaking pace/rhythm." }
      }
    },
    emotions: {
      type: Type.ARRAY,
      description: "List of dominant emotions detected throughout the speech with their estimated percentage of time present.",
      items: { 
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Emotion name." },
          percentage: { type: Type.NUMBER, description: "Estimated percentage of the speech dominated by this emotion (0-100)." }
        },
        required: ["name", "percentage"]
      }
    },
    bodyLanguage: {
      type: Type.OBJECT,
      properties: {
        eyeContact: { type: Type.STRING, enum: ["Pobre", "Bueno", "Excelente"] },
        posture: { type: Type.STRING, enum: ["Encorvado", "Relajado", "Tenso", "Erguido"] },
        gestures: { type: Type.STRING, enum: ["Limitados", "Naturales", "Excesivos"] },
        feedback: { type: Type.STRING, description: "Specific feedback on body language." }
      }
    },
    speechAnalysis: {
      type: Type.OBJECT,
      properties: {
        clarity: { type: Type.STRING, enum: ["Confuso", "Claro", "Muy Claro"] },
        coherence: { type: Type.STRING, enum: ["Baja", "Buena", "Excelente"] },
        persuasion: { type: Type.STRING, enum: ["Poco Convincente", "Convincente", "Muy Persuasivo"] },
        feedback: { type: Type.STRING, description: "Feedback on the speech content, structure and message impact." }
      }
    },
    // Premium Fields (Optional in schema logic, but defined here for structure)
    vocalAnalysis: {
      type: Type.OBJECT,
      properties: {
        toneVariety: { type: Type.STRING, enum: ["Monótono", "Variado", "Dinámico"] },
        volumeControl: { type: Type.STRING, enum: ["Bajo", "Adecuado", "Alto"] },
        articulation: { type: Type.STRING, enum: ["Confusa", "Buena", "Precisa"] },
        feedback: { type: Type.STRING, description: "Detailed feedback on vocal usage, pitch, and tone." }
      }
    },
    imageAnalysis: {
      type: Type.OBJECT,
      properties: {
        attire: { type: Type.STRING, description: "Analysis of clothing/outfit appropriateness." },
        hair: { type: Type.STRING, description: "Analysis of hairstyle and grooming." },
        face: { type: Type.STRING, description: "Analysis of face, makeup, and facial grooming." },
        feedback: { type: Type.STRING, description: "General image consulting feedback focused on the person." }
      }
    },
    improvementTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 actionable tips to improve."
    },
    actionPlan: {
      type: Type.OBJECT,
      description: "A specific plan to improve identified weaknesses.",
      properties: {
        exercises: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Concrete exercises."
        },
        dynamics: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Practice routines or games."
        },
        resources: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Recommended readings, concepts to research, or types of videos to watch."
        }
      },
      required: ["exercises", "dynamics", "resources"]
    }
  },
  required: ["overallScore", "summary", "fillerWords", "pacing", "emotions", "bodyLanguage", "speechAnalysis", "improvementTips", "actionPlan"]
};

export const analyzeVideo = async (
  base64Video: string, 
  mimeType: string, 
  language: Language, 
  isPremium: boolean,
  topic?: string,
  audience?: string,
  goal?: string
): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Config based on language
    const isEs = language === 'es';
    
    let promptText = isEs 
      ? `Actúa como un experto entrenador de oratoria de clase mundial. Analiza este video de una presentación. 
         Identifica muletillas, ritmo, emociones (con porcentajes estimados), lenguaje corporal y contenido (claridad, coherencia, persuasión).
         
         CRUCIAL: Genera un 'actionPlan' detallado basado en las debilidades detectadas:
         1. 'exercises': Ejercicios vocales o físicos específicos e inmediatos (ej. técnica del lápiz, respiración cuadrada).
         2. 'dynamics': Rutinas de práctica (ej. grabar video de 1 min diario, método PechaKucha).
         3. 'resources': Recomendaciones concretas de qué leer o investigar.`
      : `Act as a world-class public speaking coach. Analyze this presentation video.
         Identify filler words, pacing, emotions (with estimated percentages), body language, and content (clarity, coherence, persuasion).
         
         CRUCIAL: Generate a detailed 'actionPlan' based on detected weaknesses:
         1. 'exercises': Specific, immediate vocal or physical exercises (e.g., pencil technique, box breathing).
         2. 'dynamics': Practice routines (e.g., record 1 min video daily, PechaKucha method).
         3. 'resources': Concrete recommendations on what to read or research.`;

    if (isPremium) {
      promptText += isEs
        ? `\n\nMODO PREMIUM ACTIVADO:
           Debes realizar un análisis profundo adicional llenando los campos 'vocalAnalysis' y 'imageAnalysis'.
           - vocalAnalysis: Evalúa la variedad de tono (monotonía), control de volumen y articulación.
           - imageAnalysis: Actúa como consultor de imagen personal. Evalúa EXCLUSIVAMENTE la imagen del individuo para una charla/presentación:
             1. 'attire': Ropa/Vestimenta.
             2. 'hair': Peinado/Cabello.
             3. 'face': Rostro y Maquillaje (o aspecto facial general).
             IMPORTANTE: NO evalúes el fondo, el entorno ni la iluminación. Céntrate solo en la persona.`
        : `\n\nPREMIUM MODE ACTIVATED:
           You must perform an additional deep analysis by filling in the 'vocalAnalysis' and 'imageAnalysis' fields.
           - vocalAnalysis: Evaluate tone variety (monotony), volume control, and articulation.
           - imageAnalysis: Act as a personal image consultant. Evaluate EXCLUSIVELY the individual's image for a talk/presentation:
             1. 'attire': Clothing/Outfit.
             2. 'hair': Hairstyle/Hair.
             3. 'face': Face and Makeup (or general facial grooming).
             IMPORTANT: DO NOT evaluate the background, environment, or lighting. Focus only on the person.`;

      // Premium Context Injection (Topic, Audience, Goal)
      if (topic) {
        promptText += isEs 
          ? `\nCONTEXTO DEFINIDO POR EL USUARIO (Tema): El usuario indica que la presentación trata sobre: "${topic}".
             Evalúa en 'speechAnalysis.coherence' y 'summary' si el discurso se mantiene alineado a este tema.` 
          : `\nUSER DEFINED CONTEXT (Topic): The user indicates the presentation is about: "${topic}".
             Evaluate in 'speechAnalysis.coherence' and 'summary' if the speech remains aligned with this topic.`;
      }
      
      if (audience) {
        promptText += isEs 
          ? `\nPÚBLICO OBJETIVO DEFINIDO: La audiencia objetivo es: "${audience}".
             Evalúa en 'speechAnalysis.persuasion' y 'summary' si el tono, lenguaje y estilo son apropiados para este público.` 
          : `\nTARGET AUDIENCE DEFINED: The target audience is: "${audience}".
             Evaluate in 'speechAnalysis.persuasion' and 'summary' if the tone, language, and style are appropriate for this audience.`;
      }

      if (goal) {
        promptText += isEs
          ? `\nOBJETIVO PRINCIPAL DEL USUARIO: "${goal}".
             Toda tu evaluación, especialmente el 'overallScore', 'speechAnalysis.persuasion' y el 'actionPlan', debe basarse en qué tan bien el usuario cumple este objetivo específico.`
          : `\nUSER'S MAIN GOAL: "${goal}".
             Your entire evaluation, especially 'overallScore', 'speechAnalysis.persuasion', and 'actionPlan', must be based on how well the user achieves this specific goal.`;
      }
    }

    promptText += isEs ? `\nRESPUESTA DEBE ESTAR EN ESPAÑOL.` : `\nRESPONSE MUST BE IN ENGLISH.`;

    // We use gemini-2.5-flash for fast, multimodal capabilities
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Video,
              mimeType: mimeType
            }
          },
          {
            text: promptText
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing video:", error);
    throw error;
  }
};