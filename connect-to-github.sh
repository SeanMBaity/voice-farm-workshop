#!/bin/bash

echo "🚀 Voice Farm Workshop - GitHub Connection Script"
echo "=================================================="
echo ""

# Check if username is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your GitHub username as an argument"
    echo "Usage: ./connect-to-github.sh YOUR_USERNAME"
    echo ""
    echo "Example: ./connect-to-github.sh johndoe"
    exit 1
fi

USERNAME=$1
REPO_URL="https://github.com/$USERNAME/voice-farm-workshop.git"

echo "📋 Setting up connection to GitHub..."
echo "Username: $USERNAME"
echo "Repository: $REPO_URL"
echo ""

# Add remote origin
echo "🔗 Adding remote origin..."
git remote add origin $REPO_URL

if [ $? -eq 0 ]; then
    echo "✅ Remote origin added successfully"
else
    echo "❌ Failed to add remote origin"
    echo "This might mean the remote already exists or there's an issue"
    exit 1
fi

echo ""

# Push to GitHub
echo "📤 Pushing code to GitHub..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your repository is now connected to GitHub!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Visit: https://github.com/$USERNAME/voice-farm-workshop"
    echo "2. Go to the 'Issues' tab"
    echo "3. Create Issue #1 using the content from ISSUE_1_TEMPLATE.md"
    echo "4. Start the workshop!"
    echo ""
    echo "🌾 Happy farming! 🚀"
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo "This might mean:"
    echo "- The repository doesn't exist yet"
    echo "- You need to authenticate with GitHub"
    echo "- There's a network issue"
    echo ""
    echo "Please make sure you've created the repository on GitHub first!"
fi 