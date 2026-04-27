#!/bin/zsh

set -e

echo "Building the project..."
npm run build

echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting