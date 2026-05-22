#!/bin/sh

# AiDevOpps Platform Independent Start Script
# Default behavior: Clears ports and runs docker-compose up --build -d
set -e

PORT=3000
PRUNE=false
YES_CONFIRM=false
DIAGNOSTICS=false
WITH_LOCAL_LLM=false
SHOW_LOGS=false
FORCE_BUILD=true

# Parse Flags
while [ "$#" -gt 0 ]; do
  case "$1" in
    --prune) PRUNE=true ;;
    --yes) YES_CONFIRM=true ;;
    --true) YES_CONFIRM=true ;; # Alias for --yes
    --build) FORCE_BUILD=true ;;
    --diag) DIAGNOSTICS=true ;;
    --log) SHOW_LOGS=true ;;
    --with-local-llm) WITH_LOCAL_LLM=true ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

echo "🚀 Starting AiDevOps Fresh Environment..."

# 0. Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "❌ Error: Docker daemon is not running or unreachable."
  echo "Please ensure Docker Desktop is started and try again."
  exit 1
fi

# 1. Run Diagnostics if requested
if [ "$DIAGNOSTICS" = true ]; then
  echo "🔍 Running system diagnostics..."
  npx next info
fi

# 2. Clear Port 3000 (Always)
echo "⚓ Clearing port $PORT..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
  # Windows (MINGW/Cygwin)
  PID=$(netstat -ano | grep LISTENING | grep :$PORT | awk '{print $5}' | head -n 1)
  if [ ! -z "$PID" ] && [ "$PID" -gt 0 ]; then
    echo "Port $PORT occupied on Windows. Terminating PID: $PID"
    taskkill /PID $PID /F 2>/dev/null || true
  fi
else
  # Linux/macOS
  PID=$(lsof -ti:$PORT)
  if [ ! -z "$PID" ]; then
    echo "Port $PORT occupied. Terminating PIDs: $PID"
    echo "$PID" | xargs kill -9 2>/dev/null || true
  fi
fi

# 3. Delete Conflicting Files
echo "✓ No conflicting files to delete."
# Intentionally left blank to prevent accidental deletion of source files.

# 4. Docker Cleanup
echo "🧹 Stopping existing containers and clearing volumes..."
docker-compose down -v --remove-orphans || true
# 5. Optional Pruning
if [ "$PRUNE" = true ]; then
  if [ "$YES_CONFIRM" = true ]; then
    echo "🗑️  Pruning Docker system (forced)..."
    docker system prune -a -f --volumes
  else
    echo "🗑️  Pruning Docker system (interactive)..."
    docker system prune -a --volumes
  fi
fi

# 6. Build and Start
echo "🏗️  Building and starting containers..."
COMPOSE_ARGS="-f docker-compose.yml"

if [ "$WITH_LOCAL_LLM" = true ]; then
  echo "🚀 Including local LLM service (docker-compose.ollama.yml)..."
  if [ -f "docker-compose.ollama.yml" ]; then
    COMPOSE_ARGS="$COMPOSE_ARGS -f docker-compose.ollama.yml"
  else
    echo "⚠️  Warning: docker-compose.ollama.yml not found, cannot start local LLM."
  fi
fi

if [ "$FORCE_BUILD" = true ]; then
  docker-compose $COMPOSE_ARGS up --build -d
else
  docker-compose $COMPOSE_ARGS up -d
fi

# 7. Tail Logs if requested
if [ "$SHOW_LOGS" = true ]; then
  echo "📝 Attaching to logs..."
  docker-compose logs -f
fi

docker-compose ps | grep -q "Up" && echo "✅ Application accessible at http://localhost:$PORT" || (echo "❌ Container failed to start." && exit 1)