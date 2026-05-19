#!/bin/bash
set -e

echo ""
echo "👑 =========================================="
echo "   FIRST ROYAL SECURITY COMPANY"
echo "   International Courier Platform"
echo "👑 =========================================="
echo ""

# Start backend
echo "🚀 Starting backend API on port 5000..."
cd /workspace/first-royal-courier/backend
bun src/index.js &
BACKEND_PID=$!
sleep 2

# Start frontend
echo "🌐 Starting frontend on port 5173..."
cd /workspace/first-royal-courier/frontend
bunx vite --port 5173 &
FRONTEND_PID=$!
sleep 2

echo ""
echo "✅ BOTH SERVICES RUNNING"
echo ""
echo "   🌐 Website:    http://localhost:5173"
echo "   🔌 API:        http://localhost:5000/api/health"
echo ""
echo "   👑 Super Admin:  admin@firstroyalsecurity.com"
echo "   🔑 Password:     Royal@Admin2024!"
echo ""
echo "   👤 Demo User:    james@example.com"
echo "   🔑 Password:     Customer123!"
echo ""
echo "   📦 Demo Track:   FRSC-A1B2-C3D4-E5F6"
echo ""
echo "Press Ctrl+C to stop"
trap "echo ''; echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
