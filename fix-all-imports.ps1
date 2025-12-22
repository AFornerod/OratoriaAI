$files = Get-ChildItem -Path ".\components" -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Agregar 'use client' si usa hooks
    if ($content -match "useState|useEffect|useRef" -and $content -notmatch "'use client'") {
        $content = "'use client'`n`n$content"
    }
    
    # Arreglar imports
    $content = $content -replace "from '\.\./types'", "from '@/types'"
    $content = $content -replace 'from "\.\./types"', 'from "@/types"'
    $content = $content -replace "from '\.\./services/storageService'", "from '@/lib/services/storageService'"
    $content = $content -replace 'from "\.\./services/storageService"', 'from "@/lib/services/storageService"'
    
    Set-Content -Path $file.FullName -Value $content
    Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
}