#!/bin/bash
set -e

# Load MongoDB URI from credential store if available
if command -v assistant &>/dev/null; then
  export MONGODB_URI=$(assistant credentials reveal --service mongodb --field uri 2>/dev/null || echo "")
fi

# Fall back to .env file
if [ -z "$MONGODB_URI" ] && [ -f "backend/.env" ]; then
  export $(grep -v '^#' backend/.env | xargs)
fi

if [ -z "$MONGODB_URI" ]; then
  echo "❌ MONGODB_URI not set. Add it to backend/.env"
  exit 1
fi

echo ""
echo "👑 =========================================="
echo "   FIRST ROYAL SECURITY COMPANY"
echo "   International Courier Platform v2.0"
echo "👑 =========================================="
echo ""

echo "🚀 Starting backend API (Node.js + MongoDB)..."
cd /workspace/first-royal-courier/backend
bun src/index.js &
BACKEND_PID=$!
sleep 3

echo "🌐 Starting frontend (React + Vite)..."
cd /workspace/first-royal-courier/frontend
bunx vite --port 5173 &
FRONTEND_PID=$!
sleep 2

echo ""
echo "✅ RUNNING"
echo "   🌐 Website:    http://localhost:5173"
echo "   🔌 API:        http://localhost:5000/api/health"
echo "   🗄  Database:   MongoDB Atlas"
echo ""
echo "Ctrl+C to stop"
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
