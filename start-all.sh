#!/bin/bash
# Start all projects in the BizuitFormTemplate solution
# Usage: ./start-all.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting BizuitFormTemplate - All Projects"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}⚠️  Port $port is in use, killing process...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 1
}

# Check and clean ports
echo -e "${BLUE}📡 Checking ports...${NC}"
for port in 8000 3000 3001; do
    if check_port $port; then
        kill_port $port
    fi
done
echo ""

# 1. Start Backend API (Python FastAPI)
echo -e "${GREEN}[1/3] Starting Backend API (FastAPI)${NC}"
echo "      Port: 8000"
echo "      URL: http://localhost:8000"
echo ""

cd "$PROJECT_ROOT/custom-forms/backend-api"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start FastAPI in background
python3 main.py > "$PROJECT_ROOT/logs/backend-api.log" 2>&1 &
BACKEND_PID=$!
echo "      PID: $BACKEND_PID"
echo ""

# 2. Start Custom Forms Showcase (Next.js)
echo -e "${GREEN}[2/3] Starting Custom Forms Showcase${NC}"
echo "      Port: 3000"
echo "      URL: http://localhost:3000"
echo ""

cd "$PROJECT_ROOT/custom-forms-showcase"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not found. Installing...${NC}"
    npm install
fi

# Start Next.js in background
PORT=3000 npm run dev > "$PROJECT_ROOT/logs/showcase.log" 2>&1 &
SHOWCASE_PID=$!
echo "      PID: $SHOWCASE_PID"
echo ""

# 3. Start Custom Forms Runtime (Next.js)
echo -e "${GREEN}[3/3] Starting Custom Forms Runtime${NC}"
echo "      Port: 3001"
echo "      URL: http://localhost:3001"
echo ""

cd "$PROJECT_ROOT/custom-forms/runtime-app"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not found. Installing...${NC}"
    npm install
fi

# Start Next.js in background
PORT=3001 npm run dev > "$PROJECT_ROOT/logs/runtime-app.log" 2>&1 &
RUNTIME_PID=$!
echo "      PID: $RUNTIME_PID"
echo ""

# Summary
echo "=============================================="
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo ""
echo "📊 Service URLs:"
echo "   • Backend API:        http://localhost:8000"
echo "   • Showcase:           http://localhost:3000"
echo "   • Runtime App:        http://localhost:3001"
echo ""
echo "📋 Process IDs:"
echo "   • Backend API:        $BACKEND_PID"
echo "   • Showcase:           $SHOWCASE_PID"
echo "   • Runtime App:        $RUNTIME_PID"
echo ""
echo "📁 Logs:"
echo "   • Backend API:        logs/backend-api.log"
echo "   • Showcase:           logs/showcase.log"
echo "   • Runtime App:        logs/runtime-app.log"
echo ""
echo -e "${BLUE}💡 To stop all services:${NC}"
echo "   ./stop-all.sh"
echo ""
echo -e "${BLUE}💡 To view logs:${NC}"
echo "   tail -f logs/backend-api.log"
echo "   tail -f logs/showcase.log"
echo "   tail -f logs/runtime-app.log"
echo ""

# Save PIDs to file for stop script
echo "$BACKEND_PID" > "$PROJECT_ROOT/.pids/backend.pid"
echo "$SHOWCASE_PID" > "$PROJECT_ROOT/.pids/showcase.pid"
echo "$RUNTIME_PID" > "$PROJECT_ROOT/.pids/runtime.pid"

echo -e "${GREEN}🎉 Ready to develop!${NC}"
