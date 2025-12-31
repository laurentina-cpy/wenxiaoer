# 简单的API测试脚本

Write-Host "=== 城小二管理系统API测试 ===" -ForegroundColor Green

# 1. 测试登录
Write-Host "`n1. 测试管理员登录..." -ForegroundColor Yellow

try {
    $body = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/login" -Method POST -ContentType "application/json" -Body $body
    Write-Host "登录成功!" -ForegroundColor Green
    Write-Host "Token: $($response.data.token.Substring(0, 50))..."
    $token = $response.data.token
}
catch {
    Write-Host "登录失败: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. 测试获取商品列表
Write-Host "`n2. 测试获取商品列表..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $goodsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/goods/list?limit=5" -Method GET -Headers $headers
    Write-Host "商品列表获取成功!" -ForegroundColor Green
    Write-Host "商品总数: $($goodsResponse.data.pagination.total)"
    
    foreach ($item in $goodsResponse.data.list) {
        Write-Host "  - $($item.name) ￥$($item.price) 库存:$($item.stock)"
    }
}
catch {
    Write-Host "获取商品列表失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 测试获取用户列表
Write-Host "`n3. 测试获取用户列表..." -ForegroundColor Yellow

try {
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/users/list?limit=5" -Method GET -Headers $headers
    Write-Host "用户列表获取成功!" -ForegroundColor Green
    Write-Host "用户总数: $($usersResponse.data.pagination.total)"
}
catch {
    Write-Host "获取用户列表失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green