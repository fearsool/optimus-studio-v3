
Write-Host "🚀 Launching Optimus Studio Demo..." -ForegroundColor Cyan

# Start Agent in a new window
Write-Host "🤖 Starting Agent Core..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run agent"

# Start Dashboard
Write-Host "🌐 Starting Web Dashboard..." -ForegroundColor Yellow
npm run dev
