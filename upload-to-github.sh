#!/bin/bash

# Upload CHIRA web application to GitHub
cd /Users/noahfisher/Desktop/chira-web-app

# Initialize Git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Complete CHIRA web application with updated home page content"

# Set main branch
git branch -M main

# Add remote repository with authentication
git remote add origin https://aieufg2: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@github.com/aieufg2/chira-web-app.git

# Push to GitHub
git push -u origin main

echo "Upload complete!"
