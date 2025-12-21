$files = Get-ChildItem -Path ".\components" -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Reemplazar imports de storageService
    $newContent = $content -replace "from '../services/storageService'", "from '@/lib/services/storageService'"
    
    # Reemplazar imports de types
    $newContent = $newContent -replace "from '../types'", "from '@/types'"
    
    Set-Content -Path $file.FullName -Value $newContent
    Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
}

Write-Host "`n✅ Imports corregidos" -ForegroundColor Cyan