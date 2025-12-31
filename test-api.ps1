
# 城小二管理系统API测试脚本

Write-Host "=== 城小二管理系统API测试 ===" -ForegroundColor Green

# 1. 管理员登录
Write-Host "`n1. 测试管理员登录..." -ForegroundColor Yellow
$headers = @{"Content-Type" = "application/json"}
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/login" -Method POST -Headers $headers -Body $loginBody
Write-Host "登录成功!" -ForegroundColor Green
Write-Host "Token: $($loginResponse.data.token.Substring(0, 50))..."

# 设置认证头
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $($loginResponse.data.token)"
}

# 2. 获取仪表板统计
Write-Host "`n2. 测试仪表板统计..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/dashboard/stats" -Method GET -Headers $authHeaders
    Write-Host "统计数据获取成功!" -ForegroundColor Green
    Write-Host "用户数量: $($statsResponse.data.users.total_users)"
    Write-Host "商品数量: $($statsResponse.data.goods.total_goods)"
    Write-Host "订单数量: $($statsResponse.data.orders.total_orders)"
} catch {
    Write-Host "获取统计数据失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 获取商品列表
Write-Host "`n3. 测试商品列表..." -ForegroundColor Yellow
try {
    $goodsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/goods/list?page=1&limit=5" -Method GET -Headers $authHeaders
    Write-Host "商品列表获取成功!" -ForegroundColor Green
    Write-Host "商品总数: $($goodsResponse.data.pagination.total)"
    $goodsResponse.data.list | ForEach-Object {
        Write-Host "  - $($_.name) ¥$($_.price) 库存:$($_.stock)"
    }
} catch {
    Write-Host "获取商品列表失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. 获取用户列表
Write-Host "`n4. 测试用户列表..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/users/list?page=1&limit=5" -Method GET -Headers $authHeaders
    Write-Host "用户列表获取成功!" -ForegroundColor Green
    Write-Host "用户总数: $($usersResponse.data.pagination.total)"
    $usersResponse.data.list | ForEach-Object {
        Write-Host "  - $($_.nickname) ($($_.user_id))"
    }
} catch {
    Write-Host "获取用户列表失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. 获取订单列表
Write-Host "`n5. 测试订单列表..." -ForegroundColor Yellow
try {
    $ordersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/orders/list?page=1&limit=5" -Method GET -Headers $authHeaders
    Write-Host "订单列表获取成功!" -ForegroundColor Green
    Write-Host "订单总数: $($ordersResponse.data.pagination.total)"
    $ordersResponse.data.list | ForEach-Object {
        Write-Host "  - 订单号: $($_.order_number) 金额:¥$($_.total_amount) 状态:$($_.status)"
    }
} catch {
    Write-Host "获取订单列表失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== API测试完成 ===" -ForegroundColor Green
Write-Host "如需测试更多接口，请参考 ADMIN_README.md 文档" -ForegroundColor Cyan