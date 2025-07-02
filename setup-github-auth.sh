#!/bin/bash

echo "🔐 GitHub Authentication Setup"
echo "=============================="
echo ""
echo "For security reasons, we'll use a Personal Access Token instead of your password."
echo "This is the recommended and secure way to authenticate with GitHub API."
echo ""

echo "📋 Step 1: Create a Personal Access Token"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token' → 'Generate new token (classic)'"
echo "3. Give it a name like 'Voice Farm Workshop'"
echo "4. Select these scopes:"
echo "   ✅ repo (Full control of private repositories)"
echo "   ✅ public_repo (Access public repositories)"
echo "5. Click 'Generate token'"
echo "6. COPY the token (you won't see it again!)"
echo ""

echo "📋 Step 2: Set the token in your environment"
echo "Once you have the token, run:"
echo "export GITHUB_TOKEN='paste_your_copied_token_here'"
echo ""

echo "📋 Step 3: Create the issue"
echo "Then run: python3 create_github_issue.py"
echo ""

echo "🚀 Opening GitHub token creation page..."
if command -v open &> /dev/null; then
    open "https://github.com/settings/tokens"
else
    echo "Please manually visit: https://github.com/settings/tokens"
fi

echo ""
echo "⚠️  SECURITY NOTE: Never share your password or token in scripts!"
echo "✅ Personal Access Tokens are secure and can be revoked anytime." 