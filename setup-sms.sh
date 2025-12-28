#!/bin/bash

# Install expo-sms package for emergency SMS notifications
echo "Installing expo-sms package..."

cd frontend

# Check if npm or yarn is available
if command -v yarn &> /dev/null; then
    echo "Using yarn..."
    yarn add expo-sms
elif command -v npm &> /dev/null; then
    echo "Using npm..."
    npm install expo-sms
else
    echo "Error: Neither npm nor yarn found. Please install Node.js and npm/yarn."
    exit 1
fi

echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Update app.json with SMS permissions (see SOS_FEATURES_GUIDE.md)"
echo "2. Run: npm start (or yarn start)"
echo "3. Navigate to home screen and tap 'View SOS Demo & Features'"
