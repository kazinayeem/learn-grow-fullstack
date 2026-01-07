#!/bin/bash

# Email Action Endpoint Test Script
# Tests the full flow: frontend -> nginx -> backend

echo "🧪 Testing Email Action Endpoint"
echo "=================================="
echo ""

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmRlcklkIjoiNjk1ZTI5NGE5NjA2MWVkYThjNDkxY2ZiIiwiYWN0aW9uIjoiYXBwcm92ZSIsImlhdCI6MTc2Nzc3ODYzOCwiZXhwIjoxNzY3OTUxNDM4fQ.TFuvkW7aaaSTzuvlCCwln-KOPknKz6QhqrbCP9_Chp8"

echo "📧 Test Token:"
echo "$TOKEN"
echo ""

# Test 1: Direct Backend Call
echo "1️⃣  Testing Direct Backend Call..."
echo "URL: http://localhost:5000/api/orders/email-action/{token}"
echo ""
curl -s "http://localhost:5000/api/orders/email-action/$TOKEN" | head -20
echo ""
echo ""

# Test 2: Through Next.js API
echo "2️⃣  Testing Through Next.js API..."
echo "URL: http://localhost:3000/api/order/email-action/{token}"
echo ""
curl -s "http://localhost:3000/api/order/email-action/$TOKEN" | head -20
echo ""
echo ""

# Test 3: Through Nginx (if available)
echo "3️⃣  Testing Through Nginx (Production)..."
echo "URL: http://localhost/api/order/email-action/{token}"
echo ""
curl -s "http://localhost/api/order/email-action/$TOKEN" 2>&1 | head -20
echo ""
echo ""

echo "✅ Tests Complete"
