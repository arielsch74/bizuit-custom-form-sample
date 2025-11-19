#!/bin/bash
# Stop all projects in the BizuitFormTemplate solution
# Usage: ./stop-all.sh

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🛑 Stopping BizuitFormTemplate - All Projects"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill process by PID
kill_pid() {
    local pid=$1
    local name=$2

    if ps -p $pid > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping $name (PID: $pid)...${NC}"
        kill -9 $pid 2>/dev/null || true
        echo -e "${GREEN}✓ Stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  $name (PID: $pid) not running${NC}"
    fi
}

# Function to kill by port
kill_port() {
    local port=$1
    local name=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}Stopping $name on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}✓ Stopped${NC}"
    else
        echo -e "${GREEN}✓ Port $port already free${NC}"
    fi
}

# Try to stop by PID files first
if [ -f "$PROJECT_ROOT/.pids/backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_ROOT/.pids/backend.pid")
    kill_pid $BACKEND_PID "Backend API"
    rm "$PROJECT_ROOT/.pids/backend.pid"
fi

if [ -f "$PROJECT_ROOT/.pids/showcase.pid" ]; then
    SHOWCASE_PID=$(cat "$PROJECT_ROOT/.pids/showcase.pid")
    kill_pid $SHOWCASE_PID "Showcase"
    rm "$PROJECT_ROOT/.pids/showcase.pid"
fi

if [ -f "$PROJECT_ROOT/.pids/runtime.pid" ]; then
    RUNTIME_PID=$(cat "$PROJECT_ROOT/.pids/runtime.pid")
    kill_pid $RUNTIME_PID "Runtime App"
    rm "$PROJECT_ROOT/.pids/runtime.pid"
fi

echo ""

# Fallback: Kill by port (in case PID files don't exist)
echo "Ensuring all ports are free..."
kill_port 8000 "Backend API"
kill_port 3000 "Showcase"
kill_port 3001 "Runtime App"

echo ""
echo "=============================================="
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
