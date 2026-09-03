#!/bin/bash

echo "Starting Blood Bank Management System..."
echo ""

echo "Starting Backend Server..."
cd backend && npm start &
BACKEND_PID=$!

echo "Waiting for backend to initialize..."
sleep 3

echo "Starting Frontend Development Server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Blood Bank Management System is starting..."
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Default Login Credentials:"
echo "Admin: admin@bloodbank.com / admin123"
echo "Hospital: hospital@bloodbank.com / hospital123"
echo "Staff: staff@bloodbank.com / staff123"
echo ""

# Wait for user input to stop
echo "Press Ctrl+C to stop both servers"
wait