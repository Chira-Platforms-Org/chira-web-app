#!/bin/bash

echo "Starting fresh GitHub upload for CHIRA application..."

cd /Users/noahfisher/Desktop/chira-web-app

# Remove existing remote if it exists
git remote remove origin 2>/dev/null || true

# Add remote with authentication
git remote add origin https://aieufg2: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@github.com/aieufg2/chira-web-app.git

# Add all files and commit
git add .
git commit -m "Complete CHIRA web application - final upload" || echo "No changes to commit"

# Force push to ensure upload
git push origin main --force

echo "CHIRA application upload completed!"
echo "Repository URL: https://github.com/aieufg2/chira-web-app"
