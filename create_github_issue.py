#!/usr/bin/env python3
"""
Create GitHub Issue for Voice Farm Workshop
This script creates a GitHub issue using the GitHub API
"""

import json
import sys
import subprocess
import urllib.request
import urllib.parse
import urllib.error

def get_github_token():
    """Try to get GitHub token from various sources"""
    import os
    
    # Try environment variable
    token = os.environ.get('GITHUB_TOKEN')
    if token:
        return token
    
    # Try git config
    try:
        result = subprocess.run(['git', 'config', '--get', 'github.token'], 
                              capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except:
        pass
    
    return None

def read_issue_content():
    """Read the issue content from file"""
    try:
        with open('ISSUE_PRD_PARSING.md', 'r') as f:
            return f.read()
    except FileNotFoundError:
        print("❌ Error: ISSUE_PRD_PARSING.md not found")
        return None

def create_github_issue():
    """Create the GitHub issue"""
    
    # Configuration
    REPO_OWNER = "SeanMBaity"
    REPO_NAME = "voice-farm-workshop"
    ISSUE_TITLE = "Parse Voice Farm Game PRD into Development Tasks"
    
    print("🚀 Creating GitHub issue...")
    print(f"Repository: {REPO_OWNER}/{REPO_NAME}")
    print(f"Title: {ISSUE_TITLE}")
    
    # Get GitHub token
    token = get_github_token()
    if not token:
        print("\n❌ No GitHub token found!")
        print("Please set up authentication by running:")
        print("export GITHUB_TOKEN='your_token_here'")
        print("\nOr create a token at: https://github.com/settings/tokens")
        print("Then run: export GITHUB_TOKEN='your_new_token'")
        return False
    
    # Read issue content
    issue_body = read_issue_content()
    if not issue_body:
        return False
    
    # Prepare the API request
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues"
    
    data = {
        "title": ISSUE_TITLE,
        "body": issue_body,
        "labels": ["good first issue", "documentation", "planning"]
    }
    
    # Create request
    req = urllib.request.Request(url)
    req.add_header('Accept', 'application/vnd.github+json')
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('X-GitHub-Api-Version', '2022-11-28')
    req.add_header('Content-Type', 'application/json')
    
    try:
        # Send request
        response = urllib.request.urlopen(req, json.dumps(data).encode('utf-8'))
        
        if response.status == 201:
            result = json.loads(response.read().decode('utf-8'))
            print(f"✅ Issue created successfully!")
            print(f"Issue URL: {result['html_url']}")
            print(f"Issue Number: #{result['number']}")
            return True
        else:
            print(f"❌ Failed to create issue. Status: {response.status}")
            return False
            
    except urllib.error.HTTPError as e:
        error_response = e.read().decode('utf-8')
        try:
            error_data = json.loads(error_response)
            print(f"❌ GitHub API Error: {error_data.get('message', 'Unknown error')}")
        except:
            print(f"❌ HTTP Error {e.code}: {error_response}")
        return False
    except Exception as e:
        print(f"❌ Error creating issue: {str(e)}")
        return False

if __name__ == "__main__":
    success = create_github_issue()
    if not success:
        print("\n🔧 Alternative: Run the browser script instead:")
        print("./create-issue.sh")
        sys.exit(1) 