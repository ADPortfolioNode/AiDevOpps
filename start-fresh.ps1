# AiDevOpps Fresh Docker Start Script (Windows PowerShell)

Write-Host "Initiating fresh Docker environment..." -ForegroundColor Cyan

# 0. Delete Conflicting Files
Write-Host "🗑️ Deleting conflicting files..." -ForegroundColor Yellow
Remove-Item -Path "route.ts", "app/route.ts", "app/Page.tsx" -Force -ErrorAction SilentlyContinue

# 1. Stop and remove existing containers, volumes, and orphans
docker-compose down -v --remove-orphans

# 2. Clear port 3000
$process = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "Port 3000 is occupied. Clearing process ID: $($process.OwningProcess[0])..." -ForegroundColor Yellow
    Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
}

# 3. Build and start containers
docker-compose up --build -d

Write-Host "Application is starting at http://localhost:3000" -ForegroundColor Green