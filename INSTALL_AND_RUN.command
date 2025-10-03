#!/bin/bash

# Bio-geo-grafie Gallery Setup for Mac
# Make this executable with: chmod +x INSTALL_AND_RUN.command

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}"
echo "============================================"
echo "   BIO-GEO-GRAFIE VR GALLERY SETUP"
echo "============================================"
echo -e "${NC}"

# Change to script directory
cd "$(dirname "$0")"

# Function to open browser
open_browser() {
    sleep 2
    if command -v open &> /dev/null; then
        open "http://localhost:8080"
    fi
}

# Check for Python 3
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}[OK] Python 3 is already installed!${NC}"
    echo ""
    echo "Starting gallery..."
    open_browser &
    python3 -m http.server 8080 --bind 127.0.0.1
    exit 0
fi

# Check for Python (might be Python 2 or 3)
if command -v python &> /dev/null; then
    VERSION=$(python -c 'import sys; print(sys.version_info[0])')
    if [ "$VERSION" = "3" ]; then
        echo -e "${GREEN}[OK] Python is already installed!${NC}"
        echo ""
        echo "Starting gallery..."
        open_browser &
        python -m http.server 8080 --bind 127.0.0.1
        exit 0
    fi
fi

# Python 3 not found - offer installation options
echo -e "${YELLOW}Python 3 is not installed on this computer.${NC}"
echo ""
echo "This gallery needs a web server to run."
echo "Please choose an option:"
echo ""
echo "OPTIONS:"
echo "[1] Install Python 3 via Homebrew (recommended)"
echo "[2] Use Ruby server (pre-installed on Mac)"
echo "[3] Get installation instructions"
echo "[4] Exit"
echo ""
read -p "Choose option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "============================================"
        echo "   INSTALLING PYTHON 3 VIA HOMEBREW"
        echo "============================================"
        echo ""

        # Check if Homebrew is installed
        if ! command -v brew &> /dev/null; then
            echo "Homebrew is not installed. Installing Homebrew first..."
            echo "This will ask for your password."
            echo ""
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

            # Add Homebrew to PATH for Apple Silicon Macs
            if [[ -f "/opt/homebrew/bin/brew" ]]; then
                eval "$(/opt/homebrew/bin/brew shellenv)"
            fi
        fi

        echo "Installing Python 3..."
        brew install python3

        if command -v python3 &> /dev/null; then
            echo -e "${GREEN}[OK] Python 3 installed successfully!${NC}"
            echo ""
            echo "Starting gallery..."
            open_browser &
            python3 -m http.server 8080 --bind 127.0.0.1
        else
            echo -e "${RED}[ERROR] Python installation failed${NC}"
            echo "Please try manual installation from python.org"
            exit 1
        fi
        ;;

    2)
        echo ""
        echo "============================================"
        echo "   STARTING WITH RUBY SERVER"
        echo "============================================"
        echo ""

        if command -v ruby &> /dev/null; then
            echo -e "${GREEN}Gallery will open at: http://localhost:8080${NC}"
            echo "Ruby server may be slower than Python."
            echo "Press Ctrl+C to stop"
            echo ""
            open_browser &
            ruby -run -e httpd . -p 8080
        else
            echo -e "${RED}[ERROR] Ruby is not available${NC}"
            exit 1
        fi
        ;;

    3)
        echo ""
        echo "============================================"
        echo "   PYTHON 3 INSTALLATION INSTRUCTIONS"
        echo "============================================"
        echo ""
        echo "Option 1: Download from Python.org (Easiest)"
        echo "1. Visit https://python.org/downloads"
        echo "2. Click 'Download Python 3.x.x' button"
        echo "3. Run the downloaded installer"
        echo "4. Follow installation wizard"
        echo ""
        echo "Option 2: Using Homebrew (Terminal)"
        echo "1. Open Terminal"
        echo "2. Install Homebrew (if not installed):"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo "3. Install Python:"
        echo "   brew install python3"
        echo ""
        echo "Option 3: Using MacPorts (Terminal)"
        echo "1. Install MacPorts from macports.org"
        echo "2. Run: sudo port install python3"
        echo ""
        echo "After installing Python 3, run this script again."
        echo ""
        read -p "Press Enter to exit..."
        exit 0
        ;;

    4)
        echo "Exiting..."
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "============================================"
echo "   Thank you for using Bio-geo-grafie!"
echo "============================================"
echo ""
read -p "Press Enter to exit..."