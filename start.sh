#!/bin/bash

echo "========================================"
echo "Learn & Grow - Development Environment"
echo "========================================"
echo ""
echo "Installing dependencies..."
echo ""

# Install root dependencies
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing root dependencies"
        exit 1
    fi
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd grow-backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing backend dependencies"
        exit 1
    fi
fi
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd learn-grow
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing frontend dependencies"
        exit 1
    fi
fi
cd ..

echo ""
echo "========================================"
echo "All dependencies installed successfully!"
echo "========================================"
echo ""
echo "Starting development servers..."
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev
