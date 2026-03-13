$models = @("qwen2.5-coder", "deepseek-coder", "mistral", "mixtral:8x7b")

foreach ($model in $models) {
    Write-Host "Checking $model..."
    $check = ollama list | Select-String $model
    if ($check) {
        Write-Host "✅ $model is already installed." -ForegroundColor Green
    } else {
        Write-Host "⬇️ Installing $model..." -ForegroundColor Yellow
        ollama pull $model
    }
}

Write-Host "🚀 All specialized models are ready for Optimus Prime." -ForegroundColor Cyan
