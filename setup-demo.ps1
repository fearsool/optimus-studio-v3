
Write-Host "🚀 Optimus CloudBot++ Demo Setup" -ForegroundColor Cyan

# 1. Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Error "❌ Node.js not found. Please install Node.js v18+."
    exit 1
}

# 2. Install Dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
npm install better-sqlite3 dotenv
Write-Host "✅ Dependencies installed." -ForegroundColor Green

# 3. Setup .env
if (!(Test-Path .env)) {
    Write-Host "📝 Creating .env from template..." -ForegroundColor Yellow
    @"
NODE_ENV=development
SQLITE_PATH=./data/agent_memory.db
STATE_DB_NAME=agent_state.db
GOOGLE_API_KEY=YOUR_API_KEY_HERE
GOOGLE_SEARCH_ENGINE_ID=YOUR_SEARCH_ENGINE_ID_HERE
"@ | Out-File .env -Encoding utf8
    Write-Host "✅ .env created. Please update GOOGLE_API_KEY if needed." -ForegroundColor Green
}
else {
    Write-Host "ℹ️ .env already exists." -ForegroundColor Gray
}

# 4. Generate Demo Data
Write-Host "📊 Generating demo data..." -ForegroundColor Yellow
node scripts/generate-demo-data.js
Write-Host "✅ Demo data ready." -ForegroundColor Green

Write-Host "🎉 Setup Complete! Run './start-demo.ps1' to launch." -ForegroundColor Cyan
