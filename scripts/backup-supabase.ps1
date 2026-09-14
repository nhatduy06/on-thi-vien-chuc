param(
  [string]$DatabaseUrl = $env:SUPABASE_DB_URL
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($DatabaseUrl)) {
  throw 'Thiếu SUPABASE_DB_URL. Hãy đặt connection string của Supabase trước khi chạy backup.'
}

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDump) {
  throw 'Không tìm thấy pg_dump. Hãy cài PostgreSQL client hoặc Supabase CLI trước.'
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$backupDirectory = Join-Path $projectRoot 'backups'
New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupPath = Join-Path $backupDirectory "supabase-$timestamp.sql"

& $pgDump.Source $DatabaseUrl --schema=public --format=plain --no-owner --no-privileges --file=$backupPath
if ($LASTEXITCODE -ne 0) {
  Remove-Item -LiteralPath $backupPath -Force -ErrorAction SilentlyContinue
  throw "pg_dump thất bại với mã lỗi $LASTEXITCODE."
}

Write-Output "Backup đã tạo: $backupPath"
