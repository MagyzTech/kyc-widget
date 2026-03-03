#!/bin/bash

# KYC Widget Development Setup Script
# This script sets up npm link for local development testing

set -e

echo "🚀 KYC Widget Development Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WIDGET_DIR="$SCRIPT_DIR"
APP_V2_DIR="$SCRIPT_DIR/../app-v2"

echo -e "${BLUE}Widget directory:${NC} $WIDGET_DIR"
echo -e "${BLUE}App-v2 directory:${NC} $APP_V2_DIR"
echo ""

# Step 1: Build and link widget
echo -e "${YELLOW}Step 1: Building widget...${NC}"
cd "$WIDGET_DIR"
npm run build

echo -e "${YELLOW}Step 2: Creating global link...${NC}"
npm link

echo -e "${GREEN}✓ Widget linked globally${NC}"
echo ""

# Step 2: Link in app-v2
if [ -d "$APP_V2_DIR" ]; then
    echo -e "${YELLOW}Step 3: Linking widget in app-v2...${NC}"
    cd "$APP_V2_DIR"
    npm link kyc-widget-falconite
    echo -e "${GREEN}✓ Widget linked in app-v2${NC}"
else
    echo -e "${YELLOW}⚠ app-v2 directory not found at $APP_V2_DIR${NC}"
    echo "Skipping app-v2 linking"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start widget in watch mode:"
echo -e "   ${BLUE}cd $WIDGET_DIR && npm run dev${NC}"
echo ""
echo "2. Start app-v2 dev server:"
echo -e "   ${BLUE}cd $APP_V2_DIR && npm run dev${NC}"
echo ""
echo "3. Make changes to widget - they'll auto-rebuild and reflect in app-v2"
echo ""
echo "To unlink later:"
echo -e "   ${BLUE}cd $APP_V2_DIR && npm unlink kyc-widget-falconite${NC}"
echo -e "   ${BLUE}cd $APP_V2_DIR && npm install kyc-widget-falconite@latest${NC}"
