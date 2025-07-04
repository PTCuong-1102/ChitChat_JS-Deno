Write-Host "Testing ChitChat Backend API..." -ForegroundColor Green

$baseUrl = "http://localhost:8000"

Write-Host "`n1. Testing root endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method GET
    Write-Host "✅ Root endpoint works" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Root endpoint failed: $_" -ForegroundColor Red
}

Write-Host "`n2. Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health endpoint works" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Health endpoint failed: $_" -ForegroundColor Red
}

Write-Host "`n3. Testing auth test endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/test" -Method GET
    Write-Host "✅ Auth test endpoint works" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Auth test endpoint failed: $_" -ForegroundColor Red
}

Write-Host "`n4. Testing register endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        fullName = "Test User"
        userName = "testuser"
        email = "test@example.com"
        password = "testpassword123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Register endpoint works" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Register endpoint failed: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
}
