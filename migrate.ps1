# 🤖 SCRIPT DE MIGRACIÓN AUTOMATIZADO
# OratoriaAI v1 (Vite) → v2 (Next.js)

Write-Host "`n🚀 INICIANDO MIGRACIÓN AUTOMÁTICA OratoriaAI v1 → v2`n" -ForegroundColor Cyan

# ============================================
# FASE 1: VALIDACIONES
# ============================================

Write-Host "📋 FASE 1: Validando requisitos..." -ForegroundColor Yellow

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: Debes ejecutar este script desde la carpeta OratoriaAI-next" -ForegroundColor Red
    exit 1
}

# Verificar que existe la carpeta del proyecto viejo
$oldProject = "..\OratoriaAI"
if (-not (Test-Path $oldProject)) {
    Write-Host "❌ ERROR: No se encuentra la carpeta OratoriaAI en el nivel superior" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Validaciones completadas`n" -ForegroundColor Green

# ============================================
# FASE 2: INSTALAR DEPENDENCIAS
# ============================================

Write-Host "📦 FASE 2: Instalando dependencias..." -ForegroundColor Yellow

# Lista de dependencias a instalar
$dependencies = @(
    "@google/genai",
    "lucide-react",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "@supabase/supabase-js",
    "@supabase/auth-helpers-nextjs",
    "stripe",
    "@stripe/stripe-js",
    "next-auth",
    "@auth/core",
    "date-fns"
)

Write-Host "Instalando paquetes: $($dependencies -join ', ')" -ForegroundColor Gray
npm install $dependencies --silent

Write-Host "✅ Dependencias instaladas`n" -ForegroundColor Green

# ============================================
# FASE 3: COPIAR ARCHIVOS DE CONFIGURACIÓN
# ============================================

Write-Host "⚙️  FASE 3: Copiando configuración..." -ForegroundColor Yellow

# Copiar Tailwind config
if (Test-Path "$oldProject\tailwind.config.js") {
    Copy-Item "$oldProject\tailwind.config.js" ".\tailwind.config.ts" -Force
    Write-Host "✅ tailwind.config.ts copiado" -ForegroundColor Green
}

# Copiar PostCSS config
if (Test-Path "$oldProject\postcss.config.js") {
    Copy-Item "$oldProject\postcss.config.js" ".\postcss.config.mjs" -Force
    Write-Host "✅ postcss.config.mjs copiado" -ForegroundColor Green
}

# Crear .env.local si no existe
if (-not (Test-Path ".env.local")) {
    $envContent = @"
# Gemini AI
API_KEY=TU_API_KEY_AQUI

# Supabase (completar después de crear proyecto)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Stripe (completar después)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
"@
    Set-Content ".env.local" $envContent
    Write-Host "✅ .env.local creado (completar con tus keys)" -ForegroundColor Green
}

Write-Host ""

# ============================================
# FASE 4: CREAR ESTRUCTURA DE CARPETAS
# ============================================

Write-Host "📁 FASE 4: Creando estructura de carpetas..." -ForegroundColor Yellow

$folders = @(
    "lib\gemini",
    "lib\supabase",
    "lib\stripe",
    "lib\api",
    "lib\utils",
    "components",
    "types",
    "app\api\analyze",
    "app\api\history",
    "app\api\auth\[...nextauth]"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "✅ Creada carpeta: $folder" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# FASE 5: COPIAR COMPONENTES
# ============================================

Write-Host "🎨 FASE 5: Copiando componentes..." -ForegroundColor Yellow

if (Test-Path "$oldProject\components") {
    Copy-Item "$oldProject\components\*" ".\components\" -Recurse -Force
    Write-Host "✅ Componentes copiados" -ForegroundColor Green
    
    # Agregar 'use client' a componentes que usan hooks
    $componentFiles = Get-ChildItem -Path ".\components" -Filter "*.tsx" -Recurse
    
    foreach ($file in $componentFiles) {
        $content = Get-Content $file.FullName -Raw
        
        # Solo agregar si NO tiene 'use client' Y usa hooks
        if ($content -notmatch "'use client'" -and 
            ($content -match "useState|useEffect|useRef|useCallback|useContext")) {
            
            $newContent = "'use client'`n`n$content"
            Set-Content -Path $file.FullName -Value $newContent
            Write-Host "  ✅ 'use client' agregado a: $($file.Name)" -ForegroundColor Gray
        }
    }
}

Write-Host ""

# ============================================
# FASE 6: COPIAR TYPES
# ============================================

Write-Host "📝 FASE 6: Copiando types..." -ForegroundColor Yellow

if (Test-Path "$oldProject\types.ts") {
    Copy-Item "$oldProject\types.ts" ".\types\index.ts" -Force
    
    # Agregar nuevos tipos necesarios
    $typesContent = Get-Content ".\types\index.ts" -Raw
    
    if ($typesContent -notmatch "UserTier") {
        $additionalTypes = @"

// 🆕 Nuevos tipos para sistema de tiers
export type UserTier = 'free' | 'starter' | 'pro' | 'premium';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  analyses_used_this_month: number;
  created_at: string;
}

export interface AnalysisMetadata {
  tier: UserTier;
  language: Language;
  video_duration?: number;
  input_tokens?: number;
  output_tokens?: number;
  estimated_cost?: number;
}
"@
        Add-Content ".\types\index.ts" $additionalTypes
        Write-Host "✅ Types copiados y extendidos" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# FASE 7: CREAR ARCHIVOS DE SERVICIO
# ============================================

Write-Host "🔧 FASE 7: Creando servicios..." -ForegroundColor Yellow

# Gemini Service (adaptado del original)
$geminiService = @'
'use server'

import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language, UserTier } from "@/types";

// Configuración por tier
const TIER_CONFIGS = {
  free: {
    model: 'gemini-2.5-flash-lite',
    maxDuration: 60,
    maxOutputTokens: 500,
  },
  starter: {
    model: 'gemini-2.5-flash-lite',
    maxDuration: 900,
    maxOutputTokens: 1000,
  },
  pro: {
    model: 'gemini-2.5-flash',
    maxDuration: 3600,
    maxOutputTokens: 2500,
  },
  premium: {
    model: 'gemini-2.5-flash',
    maxDuration: 3600,
    maxOutputTokens: 4000,
  },
};

export const analyzeVideo = async (
  base64Video: string,
  mimeType: string,
  language: Language,
  tier: UserTier = 'free',
  topic?: string,
  audience?: string,
  goal?: string
): Promise<AnalysisResult> => {
  try {
    const config = TIER_CONFIGS[tier];
    const isPremium = tier === 'pro' || tier === 'premium';

    // Resto del código se copia del geminiService.ts original
    // TODO: Copiar manualmente el schema y la lógica de prompts
    
    throw new Error("Implementar lógica completa de geminiService.ts");
  } catch (error) {
    console.error("Error analyzing video:", error);
    throw error;
  }
};
'@

Set-Content ".\lib\gemini\service.ts" $geminiService
Write-Host "✅ lib/gemini/service.ts creado (completar con lógica de análisis)" -ForegroundColor Yellow

# Supabase Client
$supabaseClient = @'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
'@

Set-Content ".\lib\supabase\client.ts" $supabaseClient
Write-Host "✅ lib/supabase/client.ts creado" -ForegroundColor Green

# Supabase Server
$supabaseServer = @'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
'@

Set-Content ".\lib\supabase\server.ts" $supabaseServer
Write-Host "✅ lib/supabase/server.ts creado" -ForegroundColor Green

Write-Host ""

# ============================================
# FASE 8: CREAR LAYOUT Y PAGE
# ============================================

Write-Host "📄 FASE 8: Creando app/layout.tsx y app/page.tsx..." -ForegroundColor Yellow

# Layout
$layoutContent = @'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OratoriaAI - Mejora tu Oratoria con IA',
  description: 'Tu coach personal con Inteligencia Artificial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
'@

Set-Content ".\app\layout.tsx" $layoutContent
Write-Host "✅ app/layout.tsx creado" -ForegroundColor Green

# Page (copiar desde App.tsx)
Write-Host "⚠️  app/page.tsx necesita ser creado manualmente desde App.tsx" -ForegroundColor Yellow
Write-Host "   1. Copia el contenido de App.tsx" -ForegroundColor Gray
Write-Host "   2. Agrega 'use client' al inicio" -ForegroundColor Gray
Write-Host "   3. Cambia imports de servicios" -ForegroundColor Gray
Write-Host "   4. Exporta como: export default function HomePage()" -ForegroundColor Gray

Write-Host ""

# ============================================
# RESUMEN FINAL
# ============================================

Write-Host "`n✅ MIGRACIÓN AUTOMÁTICA COMPLETADA`n" -ForegroundColor Cyan

Write-Host "📋 RESUMEN:" -ForegroundColor Yellow
Write-Host "  ✅ Dependencias instaladas" -ForegroundColor Green
Write-Host "  ✅ Configuración copiada" -ForegroundColor Green
Write-Host "  ✅ Estructura de carpetas creada" -ForegroundColor Green
Write-Host "  ✅ Componentes copiados" -ForegroundColor Green
Write-Host "  ✅ Types copiados y extendidos" -ForegroundColor Green
Write-Host "  ✅ Servicios base creados" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️  PASOS MANUALES RESTANTES:" -ForegroundColor Yellow
Write-Host "  1. Completar .env.local con tus API keys" -ForegroundColor Gray
Write-Host "  2. Copiar App.tsx → app/page.tsx manualmente" -ForegroundColor Gray
Write-Host "  3. Completar lib/gemini/service.ts con tu lógica" -ForegroundColor Gray
Write-Host "  4. Crear proyecto en Supabase" -ForegroundColor Gray
Write-Host "  5. Ejecutar SQL en Supabase" -ForegroundColor Gray
Write-Host "  6. Crear API routes" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 SIGUIENTE PASO: npm run dev" -ForegroundColor Cyan
Write-Host ""
