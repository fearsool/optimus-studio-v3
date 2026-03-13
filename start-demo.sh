
#!/bin/bash

echo "🚀 Launching Optimus Studio Demo..."

# Start Agent
echo "🤖 Starting Agent Core..."
npm run agent &
AGENT_PID=$!

# Start Dashboard
echo "🌐 Starting Web Dashboard..."
npm run dev

# Cleanup on exit
kill $AGENT_PID
