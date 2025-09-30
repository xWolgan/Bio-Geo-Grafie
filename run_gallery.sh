#!/bin/bash

echo "========================================"
echo "Bio-geo-grafie VR Gallery Server"
echo "========================================"
echo ""
echo "Starting local web server..."
echo "Once started, open your browser to:"
echo ""
echo "  http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

# Check for Python
if command -v python3 &> /dev/null; then
    echo "Using Python to start server..."
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "Using Python to start server..."
    python -m http.server 8080
# Check for Node.js
elif command -v node &> /dev/null; then
    echo "Using Node.js to start server..."
    npx serve -p 8080
# Check for PHP
elif command -v php &> /dev/null; then
    echo "Using PHP to start server..."
    php -S localhost:8080
else
    echo ""
    echo "ERROR: No web server found!"
    echo ""
    echo "Please install one of the following:"
    echo "- Python from https://python.org"
    echo "- Node.js from https://nodejs.org"
    echo ""
    echo "Alternatively, you can upload this folder to a web host."
    read -p "Press any key to exit..."
fi