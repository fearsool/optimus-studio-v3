
# setup-specialized-models.ps1

Write-Host "🚀 Setting up specialized model ecosystem..." -ForegroundColor Green

# Create models directory (optional if using default Ollama path)
# mkdir -p ~/.ollama/models
# cd ~/.ollama/models

# 1. Qwen2.5-Coder for coding
Write-Host "💻 Pulling Qwen2.5-Coder..."
ollama pull qwen2.5-coder

# 2. DeepSeek for planning
Write-Host "📋 Pulling DeepSeek-Coder..."
ollama pull deepseek-coder

# 3. Mistral for Turkish
Write-Host "🇹🇷 Pulling Mistral..."
ollama pull mistral

# 4. Mixtral for creative scripts
Write-Host "🎬 Pulling Mixtral..."
ollama pull mixtral

# 5. Llama 70B for long context (Ensure you have enough VRAM/RAM!)
# Write-Host "📚 Pulling Llama 3.1 70B..."
# ollama pull llama3.1:70b

Write-Host "✅ Model ecosystem ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Available models:"
Write-Host "   ollama run qwen2.5-coder 'Write TypeScript code'"
Write-Host "   ollama run mistral 'Türkçe içerik üret'"
Write-Host "   ollama run mixtral 'Create video script'"
Write-Host "   ollama run deepseek-coder 'Plan project'"
