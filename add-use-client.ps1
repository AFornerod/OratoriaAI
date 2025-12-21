$files = Get-ChildItem -Path ".\components" -Filter "*.tsx" -Recurse -ErrorAction SilentlyContinue

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    
    if ($content -and $content -notmatch "'use client'" -and 
        ($content -match "useState|useEffect|useRef|useCallback|useContext")) {
        
        $newContent = "'use client'`n`n$content"
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "✅ Added to: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n✅ Componentes actualizados" -ForegroundColor Cyan