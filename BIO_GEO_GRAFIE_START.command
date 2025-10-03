#!/bin/bash

# Bio-geo-grafie VR Gallery Launcher for Mac
# Make this executable with: chmod +x BIO_GEO_GRAFIE_START.command

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Clear screen and set title
clear
echo -e "${BLUE}"
echo "    ===================================================="
echo "     ____  _____ ____        _____ ______ ____  "
echo "    |  _ \|_   _/ __ \      / ____|  ____/ __ \ "
echo "    | |_) | | || |  | |____| |  __| |__  | |  | |"
echo "    |  _ <  | || |  | |____| | |_ |  __| | |  | |"
echo "    | |_) |_| || |__| |    | |__| | |____| |__| |"
echo "    |____/|_____\____/      \_____|______\____/ "
echo ""
echo "                   VR GALLERY EXPERIENCE"
echo "    ===================================================="
echo -e "${NC}"

# Change to script directory
cd "$(dirname "$0")"

echo -e "${YELLOW}    [*] Checking system...${NC}"
sleep 1

# Function to open browser
open_browser() {
    sleep 2
    if command -v open &> /dev/null; then
        open "http://localhost:8080"
    fi
}

# Method 1: Check for Python 3
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}    [OK] Python 3 found${NC}"
    echo ""
    echo "    ===================================================="
    echo "                   STARTING GALLERY"
    echo "    ===================================================="
    echo ""
    echo -e "${GREEN}    Gallery URL: http://localhost:8080${NC}"
    echo -e "${YELLOW}    Opening browser automatically...${NC}"
    echo ""
    echo "    Controls:"
    echo "    - WASD to move"
    echo "    - Mouse to look around"
    echo "    - Approach objects to interact"
    echo ""
    echo -e "${YELLOW}    Press Ctrl+C to stop the server${NC}"
    echo "    ===================================================="
    echo ""

    # Open browser in background
    open_browser &

    # Start Python server
    python3 -m http.server 8080 --bind 127.0.0.1

# Method 2: Check for Python (might be Python 2 on older Macs)
elif command -v python &> /dev/null; then
    VERSION=$(python -c 'import sys; print(sys.version_info[0])')
    if [ "$VERSION" = "3" ]; then
        echo -e "${GREEN}    [OK] Python found${NC}"
        echo ""
        echo "    ===================================================="
        echo "                   STARTING GALLERY"
        echo "    ===================================================="
        echo ""

        open_browser &
        python -m http.server 8080 --bind 127.0.0.1
    else
        echo -e "${GREEN}    [OK] Python 2 found${NC}"
        echo ""
        echo "    ===================================================="
        echo "                   STARTING GALLERY"
        echo "    ===================================================="
        echo ""

        open_browser &
        python -m SimpleHTTPServer 8080
    fi

# Method 3: Use Ruby (pre-installed on Mac)
elif command -v ruby &> /dev/null; then
    echo -e "${GREEN}    [OK] Using Ruby server (pre-installed on Mac)${NC}"
    echo ""
    echo "    ===================================================="
    echo "                   STARTING GALLERY"
    echo "    ===================================================="
    echo ""
    echo -e "${GREEN}    Gallery URL: http://localhost:8080${NC}"
    echo -e "${YELLOW}    Opening browser automatically...${NC}"
    echo ""
    echo -e "${YELLOW}    Press Ctrl+C to stop the server${NC}"
    echo "    ===================================================="
    echo ""

    open_browser &

    # Ruby one-liner HTTP server with CORS headers for WebAssembly
    ruby -run -e httpd . -p 8080

# Method 4: Use PHP (might be installed)
elif command -v php &> /dev/null; then
    echo -e "${GREEN}    [OK] Using PHP server${NC}"
    echo ""
    echo "    ===================================================="
    echo "                   STARTING GALLERY"
    echo "    ===================================================="
    echo ""

    open_browser &
    php -S localhost:8080

else
    echo -e "${RED}    [ERROR] No suitable web server found!${NC}"
    echo ""
    echo "    Please install Python 3 using one of these methods:"
    echo ""
    echo "    Option 1: Download from python.org"
    echo "    - Visit https://python.org/downloads"
    echo "    - Download and install Python 3"
    echo ""
    echo "    Option 2: Use Homebrew (if installed)"
    echo "    - Run: brew install python3"
    echo ""
    echo "    Option 3: Use MacPorts (if installed)"
    echo "    - Run: sudo port install python3"
    echo ""
    echo "    After installing Python, run this script again."
    echo ""
    read -p "    Press Enter to exit..."
    exit 1
fi

echo ""
echo "    ===================================================="
echo "                  GALLERY STOPPED"
echo "    ===================================================="
echo ""
echo "    Thank you for experiencing Bio-geo-grafie!"
echo ""
read -p "    Press Enter to exit..."