#!/bin/bash

echo "🔍 Docker Setup Validation Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker
echo "1️⃣ Checking Docker installation..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is installed$(docker --version)${NC}"
else
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi

# Check Docker Compose
echo ""
echo "2️⃣ Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose is installed ($(docker-compose --version))${NC}"
else
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi

# Check .env file
echo ""
echo "3️⃣ Checking environment files..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Root .env file exists${NC}"
else
    echo -e "${YELLOW}⚠ Root .env file not found (will use defaults)${NC}"
fi

if [ -f "grow-backend/.env" ]; then
    echo -e "${GREEN}✓ Backend .env file exists${NC}"
    
    # Check MongoDB URI
    if grep -q "mongodb://.*@mongodb:27017" grow-backend/.env; then
        echo -e "${GREEN}✓ MongoDB URI configured for Docker${NC}"
    elif grep -q "mongodb+srv://" grow-backend/.env; then
        echo -e "${YELLOW}⚠ MongoDB URI still points to Atlas${NC}"
    fi
else
    echo -e "${RED}✗ Backend .env file not found${NC}"
fi

if [ -f "learn-grow/.env" ]; then
    echo -e "${GREEN}✓ Frontend .env file exists${NC}"
else
    echo -e "${YELLOW}⚠ Frontend .env file not found (will use defaults)${NC}"
fi

# Check Dockerfiles
echo ""
echo "4️⃣ Checking Dockerfiles..."
if [ -f "grow-backend/Dockerfile" ]; then
    echo -e "${GREEN}✓ Backend Dockerfile exists${NC}"
else
    echo -e "${RED}✗ Backend Dockerfile not found${NC}"
fi

if [ -f "learn-grow/Dockerfile" ]; then
    echo -e "${GREEN}✓ Frontend Dockerfile exists${NC}"
else
    echo -e "${RED}✗ Frontend Dockerfile not found${NC}"
fi

# Check docker-compose.yml
echo ""
echo "5️⃣ Checking docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.yml exists${NC}"
    
    # Check services
    if grep -q "mongodb:" docker-compose.yml; then
        echo -e "${GREEN}  ✓ MongoDB service configured${NC}"
    fi
    if grep -q "backend:" docker-compose.yml; then
        echo -e "${GREEN}  ✓ Backend service configured${NC}"
    fi
    if grep -q "frontend:" docker-compose.yml; then
        echo -e "${GREEN}  ✓ Frontend service configured${NC}"
    fi
else
    echo -e "${RED}✗ docker-compose.yml not found${NC}"
    exit 1
fi

# Check if containers are running
echo ""
echo "6️⃣ Checking running containers..."
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Some containers are running:${NC}"
    docker-compose ps
else
    echo -e "${YELLOW}⚠ No containers are currently running${NC}"
    echo "  Run: docker-compose up -d"
fi

echo ""
echo "=================================="
echo "Validation complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Update .env with your credentials"
echo "  2. Run: docker-compose up -d"
echo "  3. Check logs: docker-compose logs -f"
echo "  4. Access frontend at: http://localhost:3000"
echo ""
