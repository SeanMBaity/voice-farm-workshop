#!/bin/bash

# Voice Farm Workshop - Create PRD Parsing Issue
# This script opens GitHub with the issue content pre-filled

REPO_URL="https://github.com/SeanMBaity/voice-farm-workshop"
ISSUE_TITLE="Parse Voice Farm Game PRD into Development Tasks"

# URL encode the issue body
ISSUE_BODY=$(cat ISSUE_PRD_PARSING.md | python3 -c "import sys, urllib.parse; print(urllib.parse.quote(sys.stdin.read()))")

# Create the GitHub issue URL with pre-filled content
GITHUB_URL="${REPO_URL}/issues/new?title=${ISSUE_TITLE}&body=${ISSUE_BODY}&labels=good+first+issue,documentation,planning"

echo "🚀 Opening GitHub to create your PRD parsing issue..."
echo "Repository: ${REPO_URL}"
echo "Title: ${ISSUE_TITLE}"
echo ""
echo "Opening in browser..."

# Open the URL in the default browser
if command -v open &> /dev/null; then
    # macOS
    open "$GITHUB_URL"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "$GITHUB_URL"
elif command -v start &> /dev/null; then
    # Windows
    start "$GITHUB_URL"
else
    echo "❌ Could not auto-open browser. Please manually visit:"
    echo "$GITHUB_URL"
fi

echo "✅ GitHub issue creation page should now be open in your browser!"
echo "The title and content are pre-filled - just click 'Submit new issue'" 