#!/bin/bash

echo "🚀 Starting Task Management App..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check if backend port is available
if ! check_port 6000; then
    echo "❌ Backend port 6000 is already in use. Please stop the existing process."
    exit 1
fi

# Check if frontend port is available
if ! check_port 5174; then
    echo "⚠️  Frontend port 5174 is already in use. Using next available port."
fi

# Start backend
echo "🔧 Starting backend server on port 6000..."
cd backend
npm run build
node dist/server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server on port 5174..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Both servers are starting..."
echo "📱 Frontend: http://localhost:5174"
echo "🔧 Backend: http://localhost:6000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 