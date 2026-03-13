
#!/bin/bash

echo "🚀 Optimus CloudBot++ Demo Setup"

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18+."
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"

# 2. Install Dependencies
echo "📦 Installing dependencies..."
npm install
npm install better-sqlite3 dotenv
echo "✅ Dependencies installed."

# 3. Setup .env
if [ ! -f .env ]; then
    echo "📝 Creating .env from template..."
    cat > .env << EOL
NODE_ENV=development
SQLITE_PATH=./data/agent_memory.db
STATE_DB_NAME=agent_state.db
GOOGLE_API_KEY=YOUR_API_KEY_HERE
GOOGLE_SEARCH_ENGINE_ID=YOUR_SEARCH_ENGINE_ID_HERE
EOL
    echo "✅ .env created. Please update GOOGLE_API_KEY if needed."
else
    echo "ℹ️ .env already exists."
fi

# 4. Generate Demo Data
echo "📊 Generating demo data..."
node scripts/generate-demo-data.js
echo "✅ Demo data ready."

echo "🎉 Setup Complete! Run './start-demo.sh' to launch."
