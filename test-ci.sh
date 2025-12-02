#!/bin/bash

# Local CI/CD Test Script
# This script mimics what GitHub Actions will do

echo "🚀 Starting Local CI/CD Test..."
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2 - PASSED${NC}"
    else
        echo -e "${RED}❌ $2 - FAILED${NC}"
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -f "server/package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing server dependencies...${NC}"
cd server
npm ci
print_status $? "Server Dependencies Installation"

echo -e "${BLUE}🧪 Running server tests...${NC}"
npm test
print_status $? "Server Tests"

echo -e "${BLUE}📊 Running tests with coverage...${NC}"
npm run test:coverage
print_status $? "Test Coverage"

echo -e "${BLUE}🔍 Running security audit...${NC}"
npm audit --audit-level=moderate
print_status $? "Security Audit"

cd ..

# Check client if it exists
if [ -d "client" ]; then
    echo -e "${BLUE}📦 Installing client dependencies...${NC}"
    cd client
    npm ci
    print_status $? "Client Dependencies Installation"
    
    echo -e "${BLUE}🏗️  Building client...${NC}"
    npm run build
    print_status $? "Client Build"
    
    echo -e "${BLUE}🔍 Running client security audit...${NC}"
    npm audit --audit-level=moderate
    print_status $? "Client Security Audit"
    
    cd ..
fi

echo ""
echo -e "${GREEN}🎉 All CI/CD checks passed!${NC}"
echo -e "${GREEN}✅ Your code is ready to be pushed to GitHub${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: This script runs the same checks as GitHub Actions${NC}"
echo -e "${YELLOW}💡 Run this before pushing to catch issues early${NC}"
