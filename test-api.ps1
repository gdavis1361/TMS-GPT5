Write-Host "Testing TMS API Endpoints..." -ForegroundColor Green
Write-Host ""

$endpoints = @(
    @{Name="Health Check"; Url="http://localhost:3001/v1/health"; Method="GET"},
    @{Name="Contacts List"; Url="http://localhost:3001/v1/contacts"; Method="GET"},
    @{Name="User Count"; Url="http://localhost:3001/v1/users/count"; Method="GET"},
    @{Name="Swagger Docs"; Url="http://localhost:3001/docs"; Method="GET"}
)

foreach ($endpoint in $endpoints) {
    Write-Host "Testing: $($endpoint.Name)" -ForegroundColor Yellow
    Write-Host "URL: $($endpoint.Url)"
    
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method $endpoint.Method -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Status: $($response.StatusCode) - Success" -ForegroundColor Green
        
        if ($endpoint.Name -ne "Swagger Docs") {
            $content = $response.Content | ConvertFrom-Json | ConvertTo-Json -Compress
            Write-Host "Response: $content" -ForegroundColor Cyan
        } else {
            Write-Host "Response: HTML Documentation Page" -ForegroundColor Cyan
        }
    }
    catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Database Connection Test:" -ForegroundColor Yellow
$env:PGPASSWORD='tms'
$dbTest = & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U tms -d tms -t -c "SELECT 'PostgreSQL connected successfully';" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ $($dbTest.Trim())" -ForegroundColor Green
} else {
    Write-Host "❌ Database connection failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "API Setup Complete!" -ForegroundColor Green
Write-Host "- Database: PostgreSQL (tms@localhost:5432/tms)"
Write-Host "- API Server: http://localhost:3001"
Write-Host "- API Docs: http://localhost:3001/docs"