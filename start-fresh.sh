#!/bin/bash
# AiDevOpps Fresh Docker Start Script (Bash)

echo "Stopping existing containers and clearing volumes..."
docker-compose down -v --remove-orphans

echo "🗑️ Deleting conflicting files..."
rm -f route.ts app/route.ts app/Page.tsx

echo "Clearing port 3000..."
# Kills the process using port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "Building and starting fresh containers..."
docker-compose up --build -d